How the CSS folder is organized:

_site.less
    This file should never have any of it's own styles in it, but is only intended to be the one place where the Less kicks off, so to speak. It only contains imports, and should stay that way if at all possible. To help keep it that way, we have...
_shame.less
    For quick fixes where you might not be exactly sure where to put something. Throwing those fixes here helps to keep the _site.less clean.
/base folder
    This folder is intended to change very rarely. It currently contains the brand.less file, fonts, and mixins.
    The brand file would be one of the main places where a different theme would be applied by changing the color values.
/modules folder
    All of the .less files that were present when I starting work on the project are now either their own module, or possibly split across multiple modules if it made sense to split them up that way. I also added modules for things as I went.
    Generally, these modules have a top-level class that wraps that module and the rest of the styles live inside that top-level. There were places where the kendo or bootstrap controls required a different structure to override their styles, or where I just didn't have time to refactor things to match the structure, but that is the general idea.

I also wanted to share briefly about how I generally named things in the project. I used a version of what is called BEM (Block-Element-Modifier). Here's an example:

.sidebar //block
.sidebar_list // Bold part is the element
.sidebar_list--red // Bold part is the modifier
    In this case, .sidebar is the Block. This is often an outer wrapper for a component/module.
    In the sidebar, there is a list element, which gets a class of .sidebar_list. By naming it this way, it "namespaces" the styles for that list to be inside of the sidebar. It is an element that lives inside of the sidebar block. I use an underscore to indicate the start of an element.
    Sometimes there are cases where you need a slightly different version of the same element. In this case you use a modifier. I used a double dash to indicate a modifier.


The HTML might look like this:

/* Without the modifier */
<div class="sidebar">
    <ul class="sidebar_list">
        ...
    </ul>
</div>

/* With the modifier */
<div class="sidebar">
    <ul class="sidebar_list sidebar_list--red">
        ...
    </ul>
</div>

I used slightly different naming, but the idea is from here: http://getbem.com/naming/


Mixins:
The main place that i used mixins was with the media queries. I used the same sizes and naming that bootstrap uses. The naming is xs, sm, md, lg, xl. Here's an example of use:

.sidebar {
    // general styles for .sidebar here
    width: 100%;
    .md({
        // these styles apply to the .sidebar element, at the md media query.
        width: 50%;
    });
    .lg({
        // these styles apply to the .sidebar element, at the lg media query.
        width: 33%;
    });
}

I like this media query method because it allows for updating an element based on media query possible right inline with the rest of that element's styles. It gives a lot more context than having a separate area where you write media queries.