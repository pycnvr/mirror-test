// kewords closure
const selectedKeywordsClosure = () => {
    keywords = [];
    return ({
        add: (keyword) => keywords.push(keyword),
        remove: (index) => {
            keywords.splice(index, 1);
        },
        get: () => keywords,
        clearAll: () => keywords = []
    });
}

let selectedKeywords = selectedKeywordsClosure();

const init = async () => {
    let selectedCategories = [];
    let products = await getProducts();
    products = products.filter(x => {
        for (let i in x) return true;
        return false;
    });

    let categories = await getCategories();
    categories = categories.filter(x => {
        for (let i in x) return true;
        return false;
    });

    generateCategoryFilters(categories);
    generateProductCards(products);

    const searchBtn = document.getElementById("searchInputButton");
    searchBtn.addEventListener('click', onSearch)

    }

const generateCategoryFilters = (categories) => {
    // TODO: this
}

const generateProductCards = (products) => {
    const sectionEle = document.getElementsByClassName("content-list")[0];
    addCards(products);
}

// Generate card node to add in the DOM based on product object
const generateCardNode = (productObj) => {
    // create parent div
    let parentDiv = document.createElement("div");
    parentDiv.classList.add("card");

    // create img
    let newImg = document.createElement("img");
    if (productObj.img) {
      newImg.src = productObj.img; // set img source
    } else {
      newImg.src = "https://via.placeholder.com/300"; // set img source
    }
    newImg.style = "width:100%";

    // create child div
    let childDiv = document.createElement("div");
    childDiv.classList.add("card-container");

    // create title label
    const titleTag = document.createElement("h4");
    const titleText = document.createTextNode(productObj.name);
    titleTag.appendChild(titleText);

    // create price label
    const priceTag = document.createElement("p");
    const priceText = document.createTextNode("$" + productObj.price);
    priceTag.appendChild(priceText);

    if (productObj['isSponsored'] && productObj.isSponsored === true) {
      const sponsoredTag = document.createElement("p");
      const sponsoredText = document.createTextNode("Sponsored");
      sponsoredTag.appendChild(sponsoredText);
      childDiv.appendChild(sponsoredTag);
    }

    childDiv.appendChild(titleTag);
    childDiv.appendChild(priceTag);

    parentDiv.appendChild(newImg);
    parentDiv.appendChild(childDiv);

    return parentDiv;
}

// Removes all cards from dom
const clearCards = () => {
    let elems = document.getElementsByClassName("card");
    while (elems.length > 0) {
        elems[0].remove();
    }
}

// adds all cards in given list to the dom
const addCards = (productList) => {
    const sectionEle = document.getElementsByClassName("content-list")[0];
    productList.forEach( product => {
        let node = generateCardNode(product);
        sectionEle.appendChild(node);
    })
}

// Reset Dom list with given product list
const resetCards = (productList) => {
    clearCards();
    addCards(productList);
}

/**
 *  Returns list of objects filtered by attribute
 * @param {Array(Object)} productList 
 * @param {string} searchTerm 
 * @returns 
 */
const searchFilter = (searchList, searchTerm, attributeName = 'name') => {
    if (!searchTerm) {
        return searchList;
    }
    const matchedList = searchList
        .filter(item => item[attributeName] && item[attributeName].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
    return matchedList;
}

// Returns List of products that match category
const categoryFilter = (productList, category) => {
    return searchFilter(productList, category, 'category');
}

const idFilter = (productList, id) => {
  return searchFilter(productList, id, 'id');
}

/* adrequest related functions below */
/* sends a post request for promoted items */
//jquery ex: $.post('http://dtsjc00cvx01q.dc.dotomi.net:8290/cvx/client/ctx/sponsored', JSON.stringify(assembledRequest)

/**
 * 
 * @param {*} url 
 * @param {*} payload 
 * @returns json object
 */
const postRequest = async (url, payload, contentType = 'application/x-www-form-urlencoded') => {
    return fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'no-cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'omit', // include, *same-origin, omit
        headers: {
          'Content-Type': contentType
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(payload) // body data type must match "Content-Type" header
      })
}

// Test this
const debugAdRequest = async(requestPayload) => {
    const response = await postRequest('http://dtsjc00cvx01q.dc.dotomi.net:8290/cvx/client/ctx/sponsored?debug=1', requestPayload);
    let w = window.open('about:blank');
    w.document.open();
    w.document.write(response);
    w.document.close();
}

const fetchAdRequest = async (requestPayload) => {
  console.log('Request Payload', requestPayload);
  const res = await postRequest('http://dtsjc00cvx01q.dc.dotomi.net:8290/cvx/client/ctx/sponsored', requestPayload)
        .then(response => response.body.json())
        .then(jsonResponse => { return jsonResponse } )
        .catch( (error) => console.log("Error: " + error));
  return res;
      /*
      $.post('http://dtsjc00cvx01q.dc.dotomi.net:8290/cvx/client/ctx/sponsored', JSON.stringify(assembledRequest), function(response) {

        let sponsoredAdded = processAds({response: response, keywords: keywords, categories: [catId], units: unitsRequested});
        $.each(context.items, function(i, item) {
          if(item.category === catId && !(item.id in sponsoredAdded)) {
            context.render('templates/item.template', {id: i, item: item}).appendTo(context.$element());
          }
          else if(item.category === catId){
            context.render('templates/sponsored_item.template', {id: i, item: item}).appendTo(context.$element());
          }
        });
      });
      */

}

/**
 * Handle Ad Response object
 * @param {Object} response 
 * @returns 
 */
const handleAdResponse = (response) => {
      console.log('Epsilon sponsored ads response...\n\n' +  JSON.stringify(response));
      let sponsoredItems = {};

      if(response === ''){
        return sponsoredItems;
      }

      let hasBids = false;

      try {
        const bids = response.seatbid[0].bid;
        hasBids = bids.length > 0;

        for(let i = 0 ; i < bids.length; i++){
          const imp = bids[i];
          try {
            const sku = parseInt(imp.adm_native.assets[0].data.value);
            sponsoredItems[sku] = 1;
            console.log('Sponsored item found, SKU: ' + sku);
          }
          catch(err){
            console.log(err);
          }
        }
      }
      catch (err){
        console.log(err);
      }

      return sponsoredItems;
}

/**
 * Assemble object for post to adserver
 * @param {Array(string)} categories 
 * @param {Array(string)} keywords 
 * @param {Array(string)} units 
 * @returns 
 */
const assembleAdRequestPayload = (keywords, categories, units) => {
  console.log('assebled request data', keywords, categories, units);

      // allow media type for sponsored, company id to site.
      //const siteId = 201029;  //Put your site id here // test siteID
      const siteId = 206708; // USE THIS;
      const placementId = "ABCDEF";  //Put placementId here
      //const categories = data['categories'];
      //const keywords = data['keywords'];
      const userId = ""; // User Id
      let impSlots = [];
      for (let i=0; i < units; i++) {
          impSlots.push({
              "id" : Math.floor(Math.random()*9000000) + 1000000,
              "tagid" : placementId,
              "displaymanager":"Prebid.js",
              "displaymanagerver":"2.2.1",
          });
      }

      const assembledRequest = {
        "id" : Math.floor(Math.random()*9000000) + 1000000,//just random 7 digit
        "site" : {
          "id" :siteId ,
          "ref" : "https://demo.testmyads.com"
        },
        "device" : {
          "h": 1024,
          "w": 768
        },
        //"user" : {
        //  "buyeruid" : userId
        //},
        "ext" : {
          "contextual" : {
            "categories" : categories,
            "keywords" : keywords
          }
        },
        "imp" : impSlots
      }

      console.log('Calling Epsilon for sponsored ads...\n\n' +  JSON.stringify(assembledRequest));

      return assembledRequest;
}

const onSearch = async () => {
    const input = document.getElementById("searchInput");
    const searchText = input.value;
    console.log('input value: ', searchText);
    selectedKeywords.add(searchText);
    let categories = [];
    let unitsRequested = 2
    console.log('keywords: ', selectedKeywords.get());

    let payload = assembleAdRequestPayload(selectedKeywords.get(), categories, unitsRequested);
    let sponsoredItems = [];
    let response = '';
    if (isMock()) {
        response = await getMockAdResponse();
    } else {
        response = await fetchAdRequest(payload);
    }
    sponsoredItems = handleAdResponse(response);
    console.log(sponsoredItems);

   let products = await getProducts();
   let sponsoredProducts = getSponsoredProducts(products, sponsoredItems);
   let filteredList = searchFilter(products, searchText);

   updateProductsWithSponsored(filteredList, sponsoredProducts);
   resetCards(filteredList);
}

//TODO: test this
const onCategorySelect = async() => {
    const input = document.getElementById("categorySelected");
    const searchText = input.value;
    console.log('input value: ', searchText);
    let keywords = [];
    let categories = []; // populate array of categories
    let unitsRequested = 2

    let payload = assembleAdRequestPayload(keywords, categories, unitsRequested);
    let sponsoredItems = [];
    let response = '';
    if (isMock()) {
        response = await getMockAdResponse();
    } else {
        response = await fetchAdRequest(payload);
    }
    sponsoredItems = handleAdResponse(response);

   let products = await getProducts();
   let sponsoredProducts = getSponsoredProducts(products, sponsoredItems);
   let filteredList = searchFilter(products, searchText);

   updateProductsWithSponsored(filteredList, sponsoredProducts);
   resetCards(filteredList);

}

const updateProductsWithSponsored = (products, sponsoredProducts) => {
 // Remove sponsored products from main product list if they exist.
 const sponsIds = sponsoredProducts.map(sponsProduct => {
    let res = {}
    res[sponsProduct.id] = sponsProduct;
    return res;
 })
 for (let i = products.length -1; i >= 0; i--) {
   if (products[i].id in sponsIds) {
      products.splice(i, 1);
   }
 }

 // add sponsored products to beginning of list.
  const ids = products.map(product => {
    let res = {}
    res[product.id] = product;
    return res;
  });

  sponsoredProducts.forEach( sponsoredProduct => {
    if (sponsoredProduct.id in ids) {
      ids[sponsoredProduct.id]['isSponsored'] = true;
    } else {
      products.unshift(sponsoredProduct);
    }
  });

}

const getSponsoredProducts = (products, sponsoredItems) => {
  return products.filter( product => product.id in sponsoredItems )
  .map( product => {
    product['isSponsored'] = true;
    return product;
  })
}

const getMockAdResponse = async () => {
  const data = await fetch("assets/mock-ad-response.json")
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse } );

  console.log('Using Mock Response: ', data);
    return data;
}

const getCategories = async () => {
    return data = fetch("assets/categories.json")
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse } );
}

const getProducts = async () => {
    return  data = fetch("assets/product-data.json")
        .then(response => response.json())
        .then(jsonResponse => { return jsonResponse } );
}

const isMock = () => {
  return document.getElementById("isMock").checked
}

const debugRequestOnWindow = (request) => {
    //TODO: this
}

init();