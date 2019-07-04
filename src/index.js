// SUDODUDE
// CHROMIUM EXAMPLE MODIFIED FOR GENERIC USE

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. we can safely assume that |tabs| is a non-empty array becuase of the extension.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // INFO ABOUT TABS IN CHROME
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;


    // tab.url requires "activeTab" permission
    // remove active: true from queryInfo to see url of other tabs with "tabs" permission
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

}

/**
 * Stop blindness from all white pages
 *
 * @param {string} color The new background color.
 */
function changeBackgroundColor(color) {
  let script = `var htags = ` + JSON.stringify(html_tags) + `;`;
  script += `
    for (var k = 0; k < htags.length; k++) { 
      for ( var j = 0; j < document.getElementsByTagName(htags[k]).length; j++) {
        document.getElementsByTagName(htags[k])[j].style.backgroundColor = '` + color + `';
        document.getElementsByTagName(htags[k])[j].style.color = '#fff'; };
    }`;

  // execute script to inject js into viewed webpage
  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  // console.log(chrome.extension.getViews());
  getCurrentTabUrl((url) => {
    var onoffToggle = true;
    var on = "#2f2e2e";
    var off = "#fffeee";
    changeBackgroundColor(onoffToggle ? on : off);
    onoffToggle = !onoffToggle;
    // saveBackgroundColor(url, onoffToggle ? on : off);

    // getSavedBackgroundColor(url, (savedColor) => {
    //   if (savedColor) {
    //     changeBackgroundColor("#2f2e2e");
    //   }
    // });
  });
});
