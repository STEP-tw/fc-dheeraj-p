const encodeFormData = function() {
  const nameTextBox = document.getElementById('name');
  const commentBox = document.getElementById('comment');
  const nameHiddenField = document.getElementById('hiddenName');
  const commentHiddenFied = document.getElementById('hiddenComment');
  nameHiddenField.value = escape(nameTextBox.value);
  commentHiddenFied.value = escape(commentBox.value);
};

const createCommentsHTML = function(comments) {
  const commentsHTML = comments.map(({ date, name, comment }) => {
    return `<p>${date}: <strong>${name}</strong> : ${comment}</p>`;
  });
  return commentsHTML.join('\n');
};

const updateCommentBox = function(comments) {
  const commentBox = document.getElementById('comments');
  commentBox.innerHTML = createCommentsHTML(comments);
};

const updateComments = function() {
  fetch('/comments')
    .then(response => response.json())
    .then(updateCommentBox);
};

window.onload = function() {
  const submitButton = document.getElementById('submit');
  const reloadButton = document.getElementById('reload');
  submitButton.onclick = encodeFormData;
  reloadButton.onclick = updateComments;
  updateComments();
};
