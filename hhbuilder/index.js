// your code goes here ...
var message = document.querySelector('.debug');
var documentBody = document.querySelector('body');
var addButton = document.querySelector('button.add');
var householdContainer = document.querySelector('.household');
var submitButton = document.querySelector("button[type='submit']");

var id = 0;
var household = [];
var isEditing = false;

var errorContainer = document.createElement('UL');
documentBody.appendChild(errorContainer);

function clearScreenErrors() {
  while (errorContainer.firstChild) {
    errorContainer.removeChild(errorContainer.firstChild);
  }
}

function removeFromHousehold() {
  if (event.target.className !== 'delete') return;
  clearScreenErrors();

  var elementId = Number(event.target.dataset.typeid);
  for (var i = 0, len = household.length; i < len; i++) {
    if (elementId === household[i].id) {
      household.splice(i, 1);
      break;
    }
  }

  if (!household.length) submitButton.style.display = 'none';

  householdContainer.removeChild(event.target.parentNode);
}

function validationPassed(age, relationship) {
  var error = [];

  if (!Number(age)) {
    error.push('Age must be an integer and greater than Zero');
  }
  if (!relationship) {
    error.push('Relationship is a required field');
  }

  if (error.length) {
    for (var i = 0, len = error.length; i < len; i++) {
      var errorElement = document.createElement('LI');
      errorElement.innerHTML = error[i];
      errorContainer.appendChild(errorElement);
    }
    if (householdContainer.children) {
      householdContainer.style.display = 'block';
    }
    return false;
  }

  return true;
}

function addNewMemberToDOM(id, age, relationship, smoker) {
  var member = document.createElement('LI');
  var deleteButton = document.createElement('SPAN');
  deleteButton.textContent = ' X ';
  deleteButton.dataset.typeid = id;
  deleteButton.className = 'delete';
  deleteButton.style.cursor = 'pointer';

  member.innerHTML = (
    '<span>Age: ' + age +
    ', Relationship: ' + relationship +
    ', Smoker: ' + smoker + '</span>'
  );
  member.appendChild(deleteButton);
  householdContainer.appendChild(member);
}

function addMemberOfHousehold(event) {
  event.preventDefault();

  clearScreenErrors();
  message.style.display = 'none';

  var age = document.querySelector("input[name='age']");
  var relationship = document.querySelector("select[name='rel']");
  var smoker = document.querySelector("input[name='smoker']");

  if (!validationPassed(age.value, relationship.value)) return;

  household.push({
    id: ++id,
    age: age.value,
    smoker: smoker.checked,
    relationship: relationship.value,
  });

  addNewMemberToDOM(id, age.value, relationship.value, smoker.checked);
  submitButton.style.display = 'block';

  age.value = '';
  relationship.value = '';
  smoker.checked = false;
}

function submitHouseholdList(event) {
  event.preventDefault();

  clearScreenErrors();
  var action = submitButton.textContent;

  if (action === 'submit') {
    message.style.display = 'block';
    addButton.style.display = 'none';
    submitButton.textContent = 'edit';
    householdContainer.style.display = 'none';
    message.innerHTML = JSON.stringify(household, null, 2);
  } else {
    message.style.display = 'none';
    addButton.style.display = 'block';
    submitButton.textContent = 'submit';
    householdContainer.style.display = 'block';
  }
}

function pageLoad() {
  submitButton.style.display = 'none';
  addButton.addEventListener('click', addMemberOfHousehold);
  submitButton.addEventListener('click', submitHouseholdList);
  householdContainer.addEventListener('click', removeFromHousehold);
}

pageLoad();
