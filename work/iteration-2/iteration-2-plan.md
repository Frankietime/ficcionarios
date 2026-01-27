# Ficcionarios - Iteration 2

## Namings
- Let's rename "Ficheros" to "Fichero" and "Fichero" (like in Add Fichero) to "Entrada". The system has a Fichero in which different Entradas are created. Apply changes in all the system.

## General information
- "Authors" field should be autocompleted with the username, if the username is there do not autocomplete. Also bear in mind that this is a collaborative app so you may see another user name here, if so, append the current user name separated by comma (if it wasn't previously there).

## Ficheros (Now "Fichero")
- The complete section should be warapped inside a container as General Information to be consistent in style.
- I want each fichero to have the appearance of a library file index divider. Where the divider shows the Current story name. So the idea is to add transparency to a portion of the upper right side of the fichero so the left side looks like a divider. Therefore the divider (at left) will show a limit to the lenght of the story title, so we need to add an ellipsis and tooltip there. 
- The tooltip for terms is misplaced, appears at the bottom of the page at different positions. This may be related to the dynamic space that accordions occupy.
- Terms / Story Filters: style this dropdown with the same colors as the filter search component. Put it to the right of the filter search

## Shortcuts
- The shortcuts need to have more marging and bigger size to be noticed, also use the command component from neobrutalism
- TAB: If the focus is not inside General Information Inputs, set it to "Title", if it's already in one of the General Information Inputs, go the the next Input, and cycle only inside this controls.

## Themes
- Light theme is ALWAYS the default theme
- Add the other themes in neobrutalism (all the theme colors shown in the Styling section in the neobrutalism site) as a button group bar with a circle for each color. This button group bar should sit at the left of the light/dark toggle