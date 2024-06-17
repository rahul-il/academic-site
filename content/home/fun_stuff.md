+++
# A Demo section created with the Blank widget.
# Any elements can be added in the body: https://sourcethemes.com/academic/docs/writing-markdown-latex/
# Add more sections by duplicating this file and customizing to your requirements.

widget = "blank"  # See https://sourcethemes.com/academic/docs/page-builder/
headless = true  # This file represents a page section.
active = true  # Activate this widget? true/false
weight = 35  # Order that this section will appear.

title = "Fun Stuff"
subtitle = "not research related"

[design]
  # Choose how many columns the section has. Valid values: 1 or 2.
  columns = "1"

[design.background]
  # Apply a background color, gradient, or image.
  #   Uncomment (by removing `#`) an option to apply it.
  #   Choose a light or dark text color by setting `text_color_light`.
  #   Any HTML color name or Hex value is valid.

  # Background color.
  # color = "navy"
  
  # Background gradient.
  # gradient_start = "DarkGreen"
  # gradient_end = "ForestGreen"
  
  # Background image.
  # image = "image.jpg"  # Name of image in `static/img/`.
  # image_darken = 0.6  # Darken the image? Range 0-1 where 0 is transparent and 1 is opaque.
  # image_size = "cover"  #  Options are `cover` (default), `contain`, or `actual` size.
  # image_position = "center"  # Options include `left`, `center` (default), or `right`.
  # image_parallax = true  # Use a fun parallax-like fixed background effect? true/false
  
  # Text color (true=light or false=dark).
  # text_color_light = false

[design.spacing]
  # Customize the section spacing. Order is top, right, bottom, left.
  padding = ["20px", "0", "20px", "0"]

[advanced]
 # Custom CSS. 
 css_style = ""
 
 # CSS class.
 css_class = ""
+++

- [A desk](https://www.rahulilango.com/img/desk_pics.png) I  made for my mom :)
- [Some music](https://soundcloud.com/shattered-serenity) I co-wrote
- [An educational "game"](https://www.rahulilango.com/coloring) I created introducing the four color theorem, P vs NP, and zero knowledge proofs
- [A recipe](https://cookieandkate.com/black-bean-sweet-potato-enchiladas/) I really like
- I helped thousands of Rutgers' students make 4-year plans for their degrees
 via a (now-defunct) tool I made (ScarletScheduleDesigner)

<script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
<noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" /></noscript>
<script>
  // We enclose our code in an anonymous function, so it does not interfere with other code
  (function () {
    // What keyword should the links contain to create events for?
    // If the URL is something like https://www.example.com/product/1234
    // keyword = "/product/"
    var keyword = "";

    // Name for the event
    var event = "link_click";

    // This function binds an events to a link
    function bindToLinks(element) {
      // We check if the keyword is filled in
      if (!keyword) return console.warn("Simple Analytics: No keyword set");

      // Filter the links we want to bind to
      if (!element.href || element.href.indexOf(keyword) === -1) return;

      // We use dataset to check if we already added our event to this link
      if (element.dataset.simpleAnalytics) return;
      element.dataset.simpleAnalytics = "link-event";

      // Here we listen for links that are submitted
      element.addEventListener("click", function (event) {
        // Stop when we already handled this event
        if (element.dataset.simpleAnalyticsClicked) return;

        // If the Simple Analytics script is not loaded, we don't do anything
        if (!window.sa_loaded) return;

        // We prevent the visitor from being navigated away, because we do this later after sa_event
        event.preventDefault();

        // We look for a button in the link to find the button text
        var text = element.textContent ? element.textContent.trim().toLowerCase() : null;

        // We add this text to the metadata of our event
        var metadata = {
          text: text,
          hostname: element.hostname,
          path: element.pathname,
          id: element.getAttribute("id"),
          classes: element.getAttribute("class")
        };

        // We send the event to Simple Analytics
        window.sa_event(event, metadata, function () {
          // Now we click the link for real
          element.dataset.simpleAnalyticsClicked = "true";
          element.click();
        });
      });
    }

    // This function finds all links and passes it to the bindToLinks function
    function onDOMContentLoaded() {
      document.querySelectorAll("a").forEach(bindToLinks);
    }

    // This code runs the onDOMContentLoaded function when the page is done loading
    if (document.readyState === "ready" || document.readyState === "complete") {
      onDOMContentLoaded();
    } else {
      document.addEventListener("readystatechange", function (event) {
        if (event.target.readyState === "complete") onDOMContentLoaded();
      });
    }

    // If there is no MutationObserver, we skip the following logic
    if (!window.MutationObserver)
      return console.warn("Simple Analytics: MutationObserver not found");

    // We look for new link elements when the MutationObserver detects a change
    var callback = function (mutationList) {
      mutationList.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          // We look for link elements in the page
          if (node && node.tagName === "A") bindToLinks(node);
        });
      });
    };

    // This is the observer that detects changes on the page
    // it can happen that new links are created after the inital page load
    // For example, in a modal that pops up to change some data.
    var observer = new MutationObserver(callback);

    // Here we start observing the page for changes
    observer.observe(document.body, { childList: true, subtree: true });
  })();
</script>
