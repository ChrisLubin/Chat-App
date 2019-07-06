$(document).ready(function() {
  'use strict';
  let username;
  let age;
  let colorValues;
  let numOfMessages = 0;
  let oldDate = new Date();

  // Hides chatbox/initializes the range values to random numbers 0 - 255
  startUp();

  // Clears messages in database if it's a new day
  mayClearDatabase();

  // Makes sure that the user enters appropriate values in user info modal
  validation();

  // Sends data to client/server when a message is sent/Updates range values as user changes them in modal
  eventListeners();

  function startUp() {
    $('#chatBox').hide();
    // Shows modal when page loads
    $('#userInfoModal').modal({
      show: true,
      backdrop: 'static'
    });

    // Sets the three range values to random values
    $('#range1').val(Math.round(Math.random() * 255));
    $('#range2').val(Math.round(Math.random() * 255));
    $('#range3').val(Math.round(Math.random() * 255));
    $('#exampleText').css(
      'color',
      `rgb(${$('#range1').val()}, ${$('#range2').val()}, ${$('#range3').val()})`
    );

    // Gets the current date when the page loads
    oldDate.toLocaleString('de-DE', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'America/New_York'
    });

    oldDate = `${oldDate.getFullYear()}-${(oldDate.getMonth() + 1)}-${oldDate.getDate()}`;
    dateChecker();
  }

  function validation() {
    // Checks if fields are validated when user clicks submit button
    $('#userInfoModal').on('hide.bs.modal', e => {
      username = $('#username').val();
      username = username.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Sanitize
      age = $('#age').val();
      colorValues = [
        $('#range1').val(),
        $('#range2').val(),
        $('#range3').val()
      ];

      // Resets error messages after every submit
      $('#usernameError').html('');
      $('#ageError').html('');
      $('#colorError').html('');

      // Username can't be blank
      if (!username) {
        $('#usernameError').html('Your username cannot be blank.');
      }

      // Username can't be more than 15 characters
      if (username.length > 15) {
        $('#usernameError').html('Your username cannot be more than 15 characters.');
      }

      // Username can't start with a space
      if (username[0] === ' ') {
        if ($('#usernameError').html === '') {
          $('#usernameError').html('Your username cannot start with a space.');
        } else {
          $('#usernameError').html((i, originalText) => {
            return originalText + '<br>Your username cannot start with a space.';
          });
        }
      }

      // Username can't end with a space
      if (username[username.length - 1] === ' ') {
        if ($('#usernameError').html === '') {
          $('#usernameError').html('Your username cannot end with a space.');
        } else {
          $('#usernameError').html((i, originalText) => {
            return originalText + '<br>Your username cannot end with a space.';
          });
        }
      }

      // Age can't be blank
      if (!age) {
        $('#ageError').html('Your age cannot be blank.');
      }
      // Age can't be more than 3 numbers
      if (age.length > 3) {
        $('#ageError').html('Your age cannot be more than 3 numbers.');
      }

      // Color can't be too close to white
      if ($('#range1').val() > 220 && $('#range2').val() > 220 && $('#range3').val() > 220) {
        $('#colorError').html('Your color is too close to white.');
      }

      if (!$('#usernameError').html() && !$('#ageError').html() && !$('#colorError').html()) {
        // Fields were entered correctly
        checkForNewMessages();
        $('#userInfoModal').remove();
        $('#chatBox').show(500);
        $('#usernamePrepend').html(username);
      } else {
        // Do nothing
        e.preventDefault();
      }
    });
  }

  // Displays message on client
  function addMessageToClient(messageObj) {
    numOfMessages++;

    let additionalMessage =
      `<div ${messageObj.colorHtml} class="d-flex">
      <span class="font-weight-bold pr-1">${messageObj.username}</span>
      <span>${messageObj.message}</span>
      <span class="font-italic ml-auto pl-1">${messageObj.hour}:${messageObj.minute} ${messageObj.theM}</span>
      </div>
      `;
    $('#content').append(additionalMessage);
  }

  function sendMessageToServer(messageObj) {
    $.ajax({
      url: 'PHP/addUserToDB.php',
      type: 'POST',
      data: {
        userName: messageObj.username,
        age: messageObj.age,
        message: messageObj.message,
        timeHour: messageObj.hour,
        timeMinute: messageObj.minute,
        theM: messageObj.theM,
        r: messageObj.r,
        g: messageObj.g,
        b: messageObj.b
      },

      success: output => {
        if (output === 'Error!') {
          alert(output);
        }
      }
    });
  }

  // Event listeners for various buttons
  function eventListeners() {
    // Updates the example text on range value update
    $('input[type=range]').on('input', () => {
      $('#exampleText').css(
        'color',
        `rgb(${$('#range1').val()}, ${$('#range2').val()}, ${$('#range3').val()})`
      );
    });

    // Event listener for when 'send' button is clicked
    $('#send').click(() => {
      let data = {
        message: $('#message').val().trim(),
        origin: 'client'
      }
      data.message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Sanitize

      // Send message if it's not empty
      if (data.message) {
        const messageObj = new Message(data);
        $('#message').val('');
        sendMessageToServer(messageObj);
      }
    });

    // Event listener for when the 'enter' key is pressed to send message
    $('#message').keypress(e => {
      if (e.keyCode === 13) {
        let data = {
          message: $('#message').val().trim(),
          origin: 'client'
        }
        data.message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Sanitize
  
        // Send message if it's not empty
        if (data.message) {
          const messageObj = new Message(data);
          $('#message').val('');
          sendMessageToServer(messageObj);
        }
      }
    });
  }

  // Pings server to check if there are new messages to show
  function checkForNewMessages() {
    $.ajax({
      url: 'PHP/checkMessages.php',
      type: 'POST',
      data: {
        numOfMessages: numOfMessages
      },

      success: output => {
        // If server has messages to send to client
        if (output != 'Up to date') {
          let parsedResult = output.split('!!ee!!');
          let count = parsedResult[0] * 9 - parsedResult[0];
          let i = 0;
          let serverData = [];

          while (count >= 0) {
            serverData[i] = parsedResult[count];
            i++;
            count--;
          }

          for (i = 0; i < 8 * parsedResult[0]; i += 8) {
            const data = {
              username: serverData[i + 7],
              message: serverData[i + 6],
              hour: serverData[i + 5],
              minute: serverData[i + 4],
              theM: serverData[i + 3],
              r: serverData[i + 2],
              g: serverData[i + 1],
              b: serverData[i],
              origin: 'server'
            }

            data.username = data.username.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Sanitize
            data.message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;'); // Sanitize

            const messageObj = new Message(data);
            addMessageToClient(messageObj);
          }

          // Scrolls content down automatically
          $('#content').animate(
            { scrollTop: $('#content').prop('scrollHeight') },
            500
          );
        }

        // Pings server after 1 second
        setTimeout(checkForNewMessages, 1000);
      }
    });
  }

  // Clears messages from database if the day has changed
  function mayClearDatabase() {
    $.post('PHP/checkDatabaseTime.php', data => {
      // Sends an alert if there was an error
      if (data != '') {
        alert(data);
      }
    });
  }

  // Checks if date changed. If it does, messages on client/server are cleared.
  function dateChecker() {
    let newDate = new Date();
    newDate.toLocaleString('de-DE', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'America/New_York'
    });
    newDate = `${newDate.getFullYear()}-${(newDate.getMonth() + 1)}-${newDate.getDate()}`;

    if (oldDate != newDate) {
      oldDate = newDate;
      setTimeout(mayClearDatabase, 5000);
      setTimeout(() => {
        let adminMessage =
          '<div style="color:rgb(19, 147, 251);" class="d-flex">' +
          '<span class="font-weight-bold pr-1">Admin</span>' +
          '<span>The messages in this chat are reset everyday.</span>' +
          '<span class="font-italic ml-auto pl-1">12:00 AM</span>' +
          '</div>';
        $('#content').html(adminMessage);
        numOfMessages = 1;
      }, 7000);
    }

    // Checks again after 1 second
    setTimeout(dateChecker, 1000);
  }

  class Message {
    constructor(data) {
      this.message = data.message;
      this.origin = data.origin;

      if (data.origin === 'server') {
        // Message constructor for data from server
        this.username = data.username;
        this.hour = data.hour;
        this.minute = data.minute;
        this.theM = data.theM;
        this.r = data.r;
        this.g = data.g;
        this.b = data.b;
        this.colorHtml = `style="color:rgb(${this.r}, ${this.g}, ${this.b});"`;
      } else if (data.origin === 'client') {
        // Message constructor for data from client
        this.username = username;
        this.age = parseInt(age);
        this.r = parseInt(colorValues[0]);
        this.g = parseInt(colorValues[1]);
        this.b = parseInt(colorValues[2]);
        this.colorHtml = `style="color:rgb(${this.r}, ${this.g}, ${this.b});"`;

        // Calculate the proper time
        let currentDate = new Date();
        currentDate.toLocaleString('de-DE', {
          hour: '2-digit',
          hour12: false,
          timeZone: 'America/New_York'
        });
        this.hour = currentDate.getHours();
        this.minute = currentDate.getMinutes();

        if (this.hour > 12) {
          this.theM = 'PM';
          this.hour -= 12;
        } else if (this.hour === 12) {
          this.theM = 'PM';
        } else {
          this.theM = 'AM';
        }

        if (this.hour === 0) {
          this.hour = 12;
        }

        if (this.minute < 10) {
          this.minute = '0' + this.minute;
        }
      }
    }
  }
});
