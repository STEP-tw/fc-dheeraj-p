const encodeFormData = function() {
  const nameTextBox = document.getElementById('name');
  const commentBox = document.getElementById('comment');
  const nameHiddenField = document.getElementById('hiddenName');
  const commentHiddenFied = document.getElementById('hiddenComment');
  nameHiddenField.value = escape(nameTextBox.value);
  commentHiddenFied.value = escape(commentBox.value);
};

window.onload = function() {
  const submitButton = document.getElementById('submit');
  submitButton.onclick = encodeFormData;
};
