export default `<div class="edit_tab">
<div class="form">
<h3 style="text-align: center;">Edit Saved Tab</h3>
    <div>
        <label for="edit_tab_title">Title</label>
        <input id="edit_tab_title" type="text">
    </div>
    <div>
        <label for="edit_tab_url">URL</label>
        <input id="edit_tab_url" type="text">
    </div>
    <div>
    <label for="edit_tab_favicon">Favicon URL</label>
    <input id="edit_tab_favicon" type="text" disabled>
</div>
    <div>
        <button id="edit_tab_save">Save</button>
        <button id="edit_tab_paste">Paste from clipboard</button>
        <button id="edit_tab_cancel">Cancel</button>
    </div>
</div>
<div class="overlay"></div>
</div>`