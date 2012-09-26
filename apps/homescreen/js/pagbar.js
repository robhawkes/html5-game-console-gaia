
'use strict';

const PaginationBar = (function() {
  var style, previousTotal, scroller, prev_page;

  var dir = document.documentElement.dir === 'rtl' ? -4 : 4;

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
      if(previousTotal){
          for(var i=0;i<previousTotal;i++){
              var title_span = document.createElement("span");
              title_span.id = "marker_"+i;
              if(i === 0){
                  title_span.innerHTML = 'search';
              }
              else title_span.innerHTML = 'page '+i;

              scroller.appendChild(title_span);

          }
          document.getElementById("marker_0").setAttribute('data-current', 'true'); // Force set search.
      }
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
        previousTotal = total;
      }
      style.MozTransform = 'translateX(' + -current * dir + '%)';
        if(document.getElementById("marker_"+prev_page)) document.getElementById("marker_"+prev_page).removeAttribute('data-current');
        if(document.getElementById("marker_"+current)) document.getElementById("marker_"+current).setAttribute('data-current', 'true');

        prev_page = current;
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
