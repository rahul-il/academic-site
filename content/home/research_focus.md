+++
# A Demo section created with the Blank widget.
# Any elements can be added in the body: https://sourcethemes.com/academic/docs/writing-markdown-latex/
# Add more sections by duplicating this file and customizing to your requirements.

widget = "blank"  # See https://sourcethemes.com/academic/docs/page-builder/
headless = true  # This file represents a page section.
active = true  # Activate this widget? true/false
weight = 25  # Order that this section will appear.

title = "My Research Focus"

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

<div class="row">
  <div class="col-12 col-lg-6">
    <center><h3>The Minimum Circuit Size Problem (MCSP) and its Connections.</h3></center>
    {{< figure library="true" src="mcsp_connections_graphic.png" title="" lightbox="true" >}}
    <center>
        <a href="#" data-filter="{{ $data_filter | safeHTMLAttr }}" class="btn btn-primary btn-lg{{ if eq $idx $filter_default }} active{{ end }}">Learn More About MCSP in my TCS+ Talk</a>
    </center>
    <br/>
  </div>
  <div class="col-12 col-lg-6">
    <p>My research so far has focused on understanding the complexity of a problem called MCSP. While MCSP has been studied since at least the 1950s, it remains quite mysterious, evading the kind of understanding we have for thousands of other problems in complexity theory. Even so, researchers have discovered fascinating connections between MCSP and other areas in Theoretical Computer Science.</p>
    <p>For example, MCSP could be a "universal attack on cryptography": if you found a fast algorithm for MCSP, you could use it to break <i>any</i> type of cryptography. Thus, we expect (but do not know) that MCSP is not an easy problem to solve. My research is working towards proving MCSP is hard, which is a necessary step towards attaining <i>provably</i> secure cryptography.</p>
  </div>
</div>
