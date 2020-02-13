/// Get current logged user
var loggeduserBtn = document.getElementById("loggeduser");
loggeduser = localStorage.getItem("userLogged");

/// If user is null bye bye to index
if (loggeduser == null) {
    window.location.href = "index.html"
}

/// If not just set the name at the navbar
loggeduserBtn.innerText = loggeduser;

/**
 * Logs out from search view
 */
function logOut() {
    localStorage.removeItem("userLogged");
    window.location.href = "index.html"
}

var loadedItemsEbay = [];
var loadedItemsBestBuy = [];

/**
 * Search item in Ebay
 * @param  {string} category Category
 * @param  {string} brand Brandd
 * @param  {int} minPrice Minimum price
 * @param  {int} maxPrice Maximun price
 * @param  {int} itemsPerPage Pagination
 */
function searchEbay(category, brand, minPrice, maxPrice, itemsPerPage) {
    /// Clear Ebay items
    loadedItemsEbay = [];

    // Text
    var searchValue = document.getElementById("searchTextbox").value;

    // Category 
    category == "none" ? category = "" : null;
    // Brand
    brand == "none" ? brand = "" : null;

    /// Crete final search value
    var finalText = searchValue;

    /// If theres a category concat it to search value
    category != "" ? finalText += " " + category : null;

    /// If theres a brand concat it to search value    
    brand != "" ? finalText += " " + brand : null;

    /// Encode it for URL
    var searchValueEncoded = encodeURI(finalText);

    // Sort
    var sortValue = document.getElementById("sortSearch").value

    /// Build URL
    var url = "https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByKeywords"
    url += "&SERVICE-NAME=FindingService";
    url += "&SERVICE-VERSION=1.0.0";
    url += "&GLOBAL-ID=EBAY-ES";
    url += "&SECURITY-APPNAME=Emiliano-BestShop-PRD-35d8a3c47-3eb1ec0d";

    /// Search text
    url += "&keywords=" + searchValueEncoded;

    /// If sorting
    if (sortValue != "none") {
        url += "&sortOrder=" + sortValue;
    }

    /// If minPrice
    if (minPrice != null && minPrice != "") {
        url += '&itemFilter(0).name=MinPrice';
        url += '&itemFilter(0).value=' + minPrice;
    } else {
        url += '&itemFilter(0).name=MinPrice';
        url += '&itemFilter(0).value=' + 0;
    }

    /// If maxPrice
    if (maxPrice != null && maxPrice != "") {
        url += '&itemFilter(1).name=maxPrice';
        url += '&itemFilter(1).value=' + maxPrice;
    } else {
        url += '&itemFilter(1).name=maxPrice';
        url += '&itemFilter(1).value=' + 999999;
    }

    /// Pagination
    if (itemsPerPage != null) {
        url += '&paginationInput.entriesPerPage=' + itemsPerPage;
    }

    $.ajax({
        url: url,
        jsonp: "callback",
        dataType: "jsonp",
        success: function (response) {
            var res = response.findItemsByKeywordsResponse[0].searchResult[0].item;
            saveItemsEbay(res);
        },
        beforeSend: function () {
            /// Set loader
            document.getElementById("loader").removeAttribute("style");
            document.getElementById("loader").setAttribute("style", "z-index:9999999");

        },
        complete: function (element) {
            /// Remove loader
            document.getElementById("loader").setAttribute("style", "display:none; z-index:9999999");

        },
        error: function (error) {
            console.log(error);
        }
    });
}

/**
 * Saves items from Api call into an array
 * @param {Array} res Results from Api call
 */
function saveItemsEbay(res) {
    /// Call function to make cards for Ebay
    res.forEach(e => {
        /// Get image
        var img = "";
        if (e.galleryURL[0] == null) {
            img = "";
        } else {
            img = e.galleryURL[0] || "";
        }

        /// Get title
        var title = e.title[0].replace(/\+/g, ' ') || "";

        /// Get subtitle
        var subtitle = "";

        /// Some items do not have subtitle
        if (e.subtitle == null) {
            subtitle = "";
        } else {
            var subtitle = e.subtitle[0];
        }

        /// Get price, already in euros
        var price = e.sellingStatus[0].convertedCurrentPrice[0].__value__ || 0.0;

        /// Link
        var link = e.viewItemURL[0];

        var product = new Product(img, title, subtitle, price, "ebay", link);
        loadedItemsEbay.push(product);

        getItemProduct("containerEbay", product);


    });

}

/**
 * Search item in Best Buy
 * @param  {string} category Category
 * @param  {string} brand Brandd
 * @param  {int} minPrice Minimum price
 * @param  {int} maxPrice Maximun price
 * @param  {int} itemsPerPage Pagination
 */
function searchBestBuy(category, brand, minPrice, maxPrice, itemsPerPage) {
    // Text
    var searchValue = document.getElementById("searchTextbox").value;

    // Category 
    category == "none" ? category = "" : null;

    /// Swap Ebay categories to BestBuy categories
    category == "TV" ? category = "abcat0101000" : null;
    category == "Smartphone" ? category = "pcmcat209400050001" : null;
    category == "Health" ? category = "pcmcat242800050021" : null;

    // Brand
    brand == "none" ? brand = "" : null;

    /// Crete final search value
    var finalText = searchValue;

    /// IF brand selected, concat it to search text
    brand != "" ? finalText += " " + brand : null;

    /// Encode it for URL
    var searchValueEncoded = encodeURI(finalText);

    // Sort
    var sortValue = document.getElementById("sortSearch").value

    /// Swap from Ebay sort system to BestBuy
    sortValue == "PricePlusShippingLowest" ? sortValue = "salePrice.asc" : null;
    sortValue == "PricePlusShippingHighest" ? sortValue = "salePrice.desc" : null;
    sortValue == "BestMatch" ? sortValue = "salePrice.desc" : null;

    /// Build URL
    var url = '';

    /// Fix for advanced search
    if (searchValueEncoded.substring(searchValueEncoded.length - 3, searchValueEncoded.length) == '%20') {
        searchValueEncoded = searchValueEncoded.slice(0, -3);
    }

    /// Check if category
    if (category != "") {
        url = 'https://api.bestbuy.com/v1/products((search=' + searchValueEncoded.split('%20').join('&search=') + ')';
        url = url.replace('search=&', '');
        url += '&(categoryPath.id=' + category + '))';

    } else {
        url = 'https://api.bestbuy.com/v1/products(search=' + searchValueEncoded.split('%20').join('&search=') + ')';
        url = url.replace('search=&', '');
    }

    /// Add api
    url += '?apiKey=A0iJvovzx1h8jN9IXhGSCwjm';

    /// Check if sorting
    if (sortValue != "none") {
        url += '&sort=' + sortValue;
    }

    /// Set what we want to get from BestBuy
    url += '&show=thumbnailImage,url,name,salePrice,shortDescription';

    /// Max items
    if (itemsPerPage != null) {
        url += '&pageSize=' + itemsPerPage;
    }

    /// Return format
    url += '&format=json';

    /// Get current conversion rate https://api.fixer.io/latest?symbols=USD
    var currentUSDinEUR = 1.0;

    $.ajax({
        url: "https://api.fixer.io/latest?symbols=USD",
        dataType: "json",
        success: function (response) {
            /// Get current USD
            var res = response.rates.USD;

            /// Set val
            currentUSDinEUR = res;
        },
        error: function (error) {
            console.log(error);
        }
    });


    /// Make call to BestBuy
    $.ajax({
        url: url,
        dataType: "json",
        success: function (response) {
            var res = response.products;

            saveItemsBestBuy(res, currentUSDinEUR);
        },
        beforeSend: function () {
            /// Set loader
            document.getElementById("loader").removeAttribute("style");
            document.getElementById("loader").setAttribute("style", "z-index:9999999");


        },
        complete: function (element) {
            /// Remove loader
            document.getElementById("loader").setAttribute("style", "display:none; z-index:9999999");

        },
        error: function (error) {
            console.log(error);
        }
    });
}
/**
 * Saves the items from the Best Buy call in an array
 * @param  {Array} res Results from Api call
 * @param  {Double} currentUSDinEUR Current exchange in USD
 */
function saveItemsBestBuy(res, currentUSDinEUR) {
    /// Call function to make cards
    res.forEach(e => {

        /// Get image
        var img = e.thumbnailImage || "";

        /// Get title
        var title = e.name || "";

        /// No subtitle for BestBuy
        var subtitle = "";

        /// Get price
        var price = (e.salePrice / currentUSDinEUR).toFixed(2) || 0.0;

        /// Link
        var link = e.url;

        var product = new Product(img, title, subtitle, price, "bestbuy", link);
        loadedItemsBestBuy.push(product);

        getItemProduct("containerBestBuy", product);

    });

}
/**
 * Clears the container of items
 */
function clearContainers() {
    /// Clear ebay container
    var ebay = document.getElementById("containerEbay");
    while (ebay.firstChild) {
        ebay.removeChild(ebay.firstChild);
    }

    /// Clear BestBuy container
    var bestbuy = document.getElementById("containerBestBuy");
    while (bestbuy.firstChild) {
        bestbuy.removeChild(bestbuy.firstChild);
    }
}

function filter() {
    /// Hide message and show container
    document.getElementById("textNoSearch").setAttribute("style", "display:none");
    document.getElementById("textSearch").removeAttribute("style");

    /// Clear both containers
    clearContainers();

    /// Items per page
    var itemsPerPageValue = document.getElementById("itemsPerPage").value;

    /// Min price
    var minPriceValue = document.getElementById("minPrice").value;

    /// Max price
    var maxPriceValue = document.getElementById("maxPrice").value;

    /// Brand
    var brandValue = document.getElementById("brand").value;

    /// Category 
    var categoryValue = document.getElementById("category").value;

    /// Call ebay function to load items
    searchEbay(categoryValue, brandValue, minPriceValue, maxPriceValue, itemsPerPageValue);

    /// Call BestBuy function to load items    
    searchBestBuy(categoryValue, brandValue, minPriceValue, maxPriceValue, itemsPerPageValue);

}
/**
 * Adds product to a container
 * @param  {Type} from Ebay or BestBuy
 * @param  {Product} item Product
 */
function getItemProduct(from, item) {
    /// Get image
    var img = item.img;

    /// Get title
    var title = item.title;

    /// Get subtitle
    var subtitle = item.subtitle;

    /// Get price, already in euros
    var price = item.price;

    /// Get container
    var cont = document.getElementById(from);

    /// Do card
    var div = document.createElement("div");
    div.className = "row item-product";
    div.innerHTML = '<div class="col-md-2"><img style="width: 85px;" src="' + img + '"></div><div class="col-md-10"><div class="col-md-12"><h3 class="producto-titulo ">' + title + '</h3></div><div class="col-md-12"><p class="producto-descripcion">' + subtitle + '</p></div><div class="col-md-12"><button id="' + item.id + '" class=" precio btn btn-success" data-toggle="modal" data-target="#modal" data-id="' + item.id + '" data-from="' + item.from + '" onclick="loadModal(this)"><i class="fas fa-shopping-cart"></i> ' + price + ' €</button></div></div>';

    /// Append the card
    cont.appendChild(div);
}
/**
 * Loads modal with product information
 * @param {element} e Button source
 */
function loadModal(e) {
    /// Get modal items
    var modalTitle = document.getElementById("modalTitle");
    var modalImage = document.getElementById("modalImage");
    var modalFrom = document.getElementById("modalFrom");
    var modalFrom2 = document.getElementById("modalFrom2");
    var modalPrice = document.getElementById("modalPrice");
    var modalPay = document.getElementById("modalPay");

    /// Get ID and product type
    var id = document.getElementById(e.id).getAttribute("data-id");
    var from = document.getElementById(e.id).getAttribute("data-from");

    /// Get product
    var product = null;
    var fromForModal = "";
    from == "ebay" ? fromForModal = "Ebay" : fromForModal = "BestBuy";

    if (from == "ebay") {
        loadedItemsEbay.forEach(element => {
            if (element.id == id) {
                product = element;
            }
        });

    } else {
        loadedItemsBestBuy.forEach(element => {
            if (element.id == id) {
                product = element;
            }
        });

    }

    /// Fill information
    modalTitle.innerHTML = product.title;
    modalImage.src = product.img;
    if (from != "ebay") {
        modalImage.setAttribute("style", "width: 200px;")
    } else {
        modalImage.removeAttribute("style")

    }
    modalFrom.innerHTML = fromForModal;
    modalFrom2.innerHTML = fromForModal;
    modalPrice.innerHTML = product.price;
    modalPay.setAttribute("formaction", product.link);
}
/**
 * Clears all advanced filters
 */
function clearFilter() {
    /// Get select containers
    var category = document.getElementById("category");
    var brands = document.getElementById("brand");

    /// Sort
    var sorterValue = document.getElementById("sortSearch").selectedIndex = 0;

    /// Items per page
    var itemsPerPageValue = document.getElementById("itemsPerPage").selectedIndex = 0;

    /// Min price
    var minPriceValue = document.getElementById("minPrice").value = "";

    /// Max price
    var maxPriceValue = document.getElementById("maxPrice").value = "";

    /// Remove elements of brands
    while (brands.firstChild) {
        brands.removeChild(brands.firstChild);
    }

    let option = document.createElement("option");
    option.value = "none";
    option.innerText = "Brands";
    brands.appendChild(option);

}

/**
 * Updates the dropdown of Brands
 */
function setBrands() {
    /// Get select containers
    var category = document.getElementById("category");
    var brands = document.getElementById("brand");

    /// Remove elements of brands
    while (brands.firstChild) {
        brands.removeChild(brands.firstChild);
    }

    /// Hand made arrays
    const tvArray = ["Brands", "Sony", "Samsung", "LG", "Xiaomi", "Philips", "Panasonic", "Toshiba", "Sharp", "Vizio"];
    const smartphoneArray = ["Brands", "Apple", "Samsung", "LG", "Xiaomi", "Motorola", "Nokia", "Sony", "Wiko", "Huawei", "HTC", "Meizu", "BQ", "Microsoft"];
    const healthArray = ["Brands", "Mac", "Nike", "NYX", "Adidas", "Loreal", "Rebook", "Domyos", "Puma", "Fila", "Sketcher"];

    /// If TV
    if (category.value == "TV") {
        tvArray.forEach(element => {

            if (element == "Brands") {
                let option = document.createElement("option");
                option.value = "none";
                option.innerText = element;
                brands.appendChild(option);
            } else {
                let option = document.createElement("option");
                option.value = element;
                option.innerText = element;
                brands.appendChild(option);
            }



        });
        /// If smartphone
    } else if (category.value == "Smartphone") {
        smartphoneArray.forEach(element => {
            if (element == "Brands") {
                let option = document.createElement("option");
                option.value = "none";
                option.innerText = element;
                brands.appendChild(option);
            } else {
                let option = document.createElement("option");
                option.value = element;
                option.innerText = element;
                brands.appendChild(option);
            }

        });
        /// If health
    } else if (category.value == "Health") {
        healthArray.forEach(element => {
            if (element == "Brands") {
                let option = document.createElement("option");
                option.value = "none";
                option.innerText = element;
                brands.appendChild(option);
            } else {
                let option = document.createElement("option");
                option.value = element;
                option.innerText = element;
                brands.appendChild(option);
            }

        });
    } else {
        let option = document.createElement("option");
        option.value = "none";
        option.innerText = "Brands";
        brands.appendChild(option);
    }
}