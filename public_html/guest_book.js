const encodeFormData = function() {
  const nameTextBox = document.getElementById('name');
  const commentBox = document.getElementById('comment');
  const nameHiddenField = document.getElementById('hiddenName');
  const commentHiddenFied = document.getElementById('hiddenComment');
  nameHiddenField.value = escape(nameTextBox.value);
  commentHiddenFied.value = escape(commentBox.value);
};

const updateCommentBox = function(content) {
  const commentBox = document.getElementById('comments');
  commentBox.innerHTML = content;
};

const updateComments = function() {
  fetch('/comments')
    .then(response => response.text())
    .then(updateCommentBox);
};

window.onload = function() {
  const submitButton = document.getElementById('submit');
  const reloadButton = document.getElementById('reload');
  submitButton.onclick = encodeFormData;
  reloadButton.onclick = updateComments;
};
