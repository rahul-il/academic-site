+++
# A Demo section created with the Blank widget.
# Any elements can be added in the body: https://sourcethemes.com/academic/docs/writing-markdown-latex/
# Add more sections by duplicating this file and customizing to your requirements.

widget = "blank"  # See https://sourcethemes.com/academic/docs/page-builder/
headless = true  # This file represents a page section.
active = true  # Activate this widget? true/false
weight = 25  # Order that this section will appear.

title = "My Research Focus"
subtitle = "The Minimum Circuit Size Problem (MCSP) and Its Connections"

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

Welcome to the **Academic Kickstart** template!

<div class="row">
  <div class="col-12 col-lg-6">
    <h1> Hi</h1>
    {{< figure library="true" src="mcsp_connections_graphic.png" title="A caption" lightbox="true" >}}
    <p>1</p>
    ![alternative text for search engines](/img/mcsp_connections_graphic.png)
    <p>2</p>
    < figure library="true" src="mcsp_connections_graphic.png" title="A caption" lightbox="true" >
      <p>3</p>
      <img src="mcsp_connections_graphic.png" title="A caption" >
  </div>
  <div class="col-12 col-lg-6">
    <h1> Bye!</h1>
  </div>
</div>
