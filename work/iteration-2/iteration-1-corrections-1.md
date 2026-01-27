# Iteration 1 Corrections (1)
You have already run the [claude-plan.md](../iteration-1/claude-plan.md). This are the corrections we need to start Iteration 2.
All conclussions and important messages from this correction process must be written in a corrections-message.md file at this folder.

Here are the corrections:

## Auth
Remove the "Create Account" feature. Users will be created by myself using a cli tool. What tool can we use to do this (and ensure the password is created with has) or is there a simpler way to do this? Or is better to let you create a cli tool?

## Dashboard

### Table
The "Ficheros" column is wrong, this should be "Cuentos" and each cell should specify the number of cuentos like this "{n} cuentos" with underline and have a tooltip when hovering the text that shows a tooltip card (from neobrutalism library) with "CUENTOS INCLUIDOS" as header and a list of the titles of cuentos included in the ficcionario as body.
The "Created By" Column is missing.
The "Updated" cell must specify hour and time zone´and have a subtitle with the user name that made the update.
The "Actions" are missing the pencil for edition and the generate button to generate the dictionary directly from table

## Ficcionario

### General Actions
Ficcionarios shouldn't be saved on the fly as the user inserts data. If there is a clear reason to do this mention i in corrections-message.md.
There should be a Save Button and a Delete Button.
Save button shouldn't have the same enable validation as the Generate Dictionary button. “Saved ✓” is shown after a successfull save.
“Saving…” when the Save is in process and “Unsaved changes” when the form is dirty. Form is not dirty after succesfull save.

### General Information
"Authors" field should be autocompleted with the username, if the username is there do not complete. Also bear in mind that this is a collaborative app so you may see another user name here, if so, add the current user name separated by comma (if it wasn't previously there).
Input and Output languages should be dropdowns with es-es and en-en options

### Ficheros
The icon for the Open/Collapse all toggle should be similar as in Visual Studio 2022. If the icons are not there, just create a button that says "OPEN/COLLAPSE". 
At the right of this toggle, there should be a search input field to filter terms or story titles in the Ficheros. This is selected using a dropdown integrated into the search field. The placeholder always is "Filter by...".
The title should not be "Ficheros #" But the name of the Story in that  (with the book icon).
Next to the number of terms there is dot and a book icon, remove the book icon and replace for a script icon (this will be the icon related to terms) and put all the terms. Elipsis and tooltip when max width is reached.

### Story
When the user types in the search field, options should be shown filtered as the user types

### Validations
The actual system let a user create two Ficheros with the exact same data, this should be notified as soon as the user makes this error (not waiting for save to validate this) and the validation should only use terms + story hash. Save is disabled when this validation don't pass.

# Miscelaneous
- Move the Delete Button to the right and remove the text so the button is smaller and less clickeable.
- Remove the Unsaved Changes info, instead, the save is enabled when there are unsaved changes and if not, is disabled.
- Add shortcut key control over some functions, put a legend under the buttons to indicate the shortcut: 
    - Save is Ctrl + S in windows and the common combination for MacOS
    - Add Fichero is "+"
    - "Tab" always iterate through General Info Inputs (and not other parts of the UI such as buttons or any other thing)