let jsonToCSV = (objArray) => {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line != '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
};

let getElementByXpath = (path) => {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

let nodePriceToNumber = (nodePrice) => {
  let price = nodePrice ? Number(`${nodePrice.innerText}`.substring(1, nodePrice.innerText.length)) : 1;
  return price;
};

let getCart = () => {
  let cart = [];
  let nodeCartItems = getElementByXpath(`//div[@id='sidebar-sticky-boundary']/section[1]/div/ul`);
  let countItemCart = nodeCartItems ? nodeCartItems.childElementCount : -1;
  console.log(`cart has total ${countItemCart} items`);
  for (var i = 0; i < countItemCart; i++) {
    let nodeSize = getElementByXpath(
      `//div[@id='sidebar-sticky-boundary']/section[1]/div/ul/li[${i + 1}]/article/div[1]/ul/li[3]/span[2]`,
    );
    let nodeCode = getElementByXpath(
      `//div[@id='sidebar-sticky-boundary']/section[1]/div/ul/li[${i + 1}]/article/div[1]/ul/li[1]/span[2]`,
    );

    let nodeSalePrice = getElementByXpath(
      `//div[@id='sidebar-sticky-boundary']/section[1]/div/ul/li[${i + 1}]/article/div[1]/div[2]/span[1]`,
    );

    let nodeOriginPrice = getElementByXpath(
      `//div[@id='sidebar-sticky-boundary']/section[1]/div/ul/li[${i + 1}]/article/div[1]/span`,
    );

    let nodeTotalPrice = getElementByXpath(
      `//div[@id='sidebar-sticky-boundary']/section[1]/div/ul/li[${i + 1}]/article/div[1]/ul/li[4]/span[2]`,
    );

    let code = nodeCode ? nodeCode.innerText : '';
    let size = nodeSize ? nodeSize.innerText.replace('Few pieces left', '') : '';
    let originPrice = nodePriceToNumber(nodeOriginPrice);
    let price = nodeSalePrice ? nodePriceToNumber(nodeSalePrice) : originPrice;

    let totalPrice = nodePriceToNumber(nodeTotalPrice);
    let quantity = Math.round(totalPrice / price);
    let realPrice = price || originPrice;
    let buyPrice = realPrice > 5 ? Math.round(realPrice - 3 - 0.25 * realPrice) : realPrice >= 4 ? realPrice - 3 : -1;
    let total;
    for (let i = 0; i < quantity; i++) {
      cart.push({
        code,
        size,
        price: price || originPrice,
        originPrice,
        buyPrice,
      });
    }
  }
  return cart;
};

let downloadCSV = () => {
  let cart = getCart();
  cart = cart.map((item) => ({
    ...item,
    code: `'${item.code}`,
    size: `'${item.size}`,
  }));
  console.log(jsonToCSV(cart));
  let csvData = jsonToCSV(cart);
  var link = document.createElement('a');
  link.setAttribute('href', 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvData));
  link.setAttribute('download', 'cart.csv');
  link.click();
};

let saveToSever = () => {
  let accountEmail = prompt('What is account email?', '@gmail.com');
  let cart = getCart();
  console.log(`send cart with ${cart.length} items to email ${accountEmail}`);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
    }
  };
  xhr.send(JSON.stringify({ accountEmail, cart }));
};

downloadCSV();
