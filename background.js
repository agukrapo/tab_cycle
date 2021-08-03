let enabled = 0;
let tabsIds = []
let curTabIdx = 0

/*
 * Updates the icon if tab cycling is enabled
 */
function updateIcon() {
  browser.browserAction.setIcon({
    path: enabled !== 0 ? {
      30: "icons/cycle-enabled.png",
    } : {
      30: "icons/cycle-disabled.png",
    },
  });
}

function shuffle(a) {
  console.log("Shuffling", a.length, "tabs")

  let curr = a.length,  rand
  while (0 !== curr) {
    rand = Math.floor(Math.random() * curr)
    curr--
    [a[curr], a[rand]] = [a[rand], a[curr]]
  }
}

/*
 * Make the next tab active
 */
function openNextTab() {
  browser.tabs.query({currentWindow: true})
    .then(tabs => {
      if (tabsIds.length !== tabs.length) {
        tabsIds = Array.from(tabs, t => t.id)
        shuffle(tabsIds)
        curTabIdx = -1
      }

      curTabIdx = (curTabIdx + 1) % tabsIds.length
      const newId = tabsIds[curTabIdx];
      console.log("New tab ===>", curTabIdx, newId)

      if (curTabIdx === tabsIds.length - 1) {
        shuffle(tabsIds)
      }
      return browser.tabs.update( newId, {active:  true });
    });
}

/*
 * Enable periodic tab cycling
 */
function toggleTabCycle() {
  if (enabled === 0) {
    browser.storage.sync.get('delay')
      .then((res) => {
        const delay  = (res.delay !== undefined) ? res.delay * 1000 : 5000;
        enabled = setInterval(openNextTab, delay);
        updateIcon();
      });
  } else {
    clearInterval(enabled);
    enabled = 0;
    tabsIds = []
    curTabIdx = 0
    updateIcon();
  }
}

browser.browserAction.onClicked.addListener(toggleTabCycle);
