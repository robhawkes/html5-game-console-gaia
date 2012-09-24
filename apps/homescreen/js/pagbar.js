
'use strict';

const PaginationBar = (function() {
  var style, previousTotal, scroller;

  var dir = document.documentElement.dir === 'rtl' ? -20 : 20;

  return {
    /*
     * Initializes the pagination bar
     *
     * @param {String} container that holds the pagination bar
     */
    init: function pb_init(element) {
      scroller = (typeof element == 'object') ?
          element : document.querySelector(element);
      style = scroller.style;
      scroller.addEventListener('keypress', this);
    },

    /*
     * Shows the pagination bar
     *
     * @param {String} container that holds the pagination bar
     */
    show: function pb_show() {
   
      style.visibility = 'visible';
    },

    /*
     * Updates the progress of the bar
     *
     * @param {int} current page (start index is zero)
     *
     * @param {int} total number of pages
     */
    update: function pb_update(current, total) {
      scroller.setAttribute('aria-valuenow', current);
      scroller.setAttribute('aria-valuemax', total - 1);
      if (total && previousTotal !== total) {
        style.width = (100 / total) + '%';
        previousTotal = total;
      }

      style.MozTransform = 'translateX(' + current * dir + '%)';
      if(current === 0) scroller.innerHTML = 'search';
      else scroller.innerHTML = 'page: '+current;

    },

    handleEvent: function pb_handleEvent(evt) {
      if (evt.type != 'keypress' || !evt.ctrlKey)
        return;

      switch (evt.keyCode) {
        case evt.DOM_VK_RIGHT:
          GridManager.goToNextPage();
          break;
        case evt.DOM_VK_LEFT:
          GridManager.goToPreviousPage();
          break;
      }
    }
  };
}());
