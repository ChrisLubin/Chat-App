$(document).ready(function() {
  let username;
  let age;
  let message;
  let currentHour;
  let currentMinute;
  let theM;
  let colorValues;
  let numOfMessages = 0;
  let date = new Date();
  let oldDate;

  //Hides chatbox/initializes the range values to random numbers 0 - 255
  startUp();

  //Clears messages in database if it's a new day
  mayClearDatabase();

  //Makes sure that the user enters appropriate values in user info modal
  validation();

  //Sends data to client/server when a message is sent/Updates range values as user changes them in modal
  eventListeners();

  function startUp() {
    $('#chatBox').hide();
    //Shows modal when page loads
    $('#userInfoModal').modal({
      show: true,
      backdrop: 'static'
    });

    //Sets the three range values to random values
    $('#range1').val(Math.round(Math.random() * 255));
    $('#range2').val(Math.round(Math.random() * 255));
    $('#range3').val(Math.round(Math.random() * 255));
    $('#exampleText').css(
      'color',
      'rgb(' +
        $('#range1').val() +
        ', ' +
        $('#range2').val() +
        ', ' +
        $('#range3').val() +
        ')'
    );

    //Gets the current date when the page loads
    date.toLocaleString('de-DE', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'America/New_York'
    });

    oldDate =
      date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    dateChecker();
  }

  function validation() {
    //Checks if fields are validated when user clicks 'x' or 'submit'
    $('#userInfoModal').on('hide.bs.modal', function(e) {
      username = $('#username').val();
      age = $('#age').val();
      colorValues = [
        $('#range1').val(),
        $('#range2').val(),
        $('#range3').val()
      ];

      //Resets error messages after every submit
      $('#usernameError').html('');
      $('#ageError').html('');
      $('#colorError').html('');

      //Username can't be blank
      if (username == '') {
        $('#usernameError').html('Your username cannot be blank.');
      }

      //Username can't be more than 15 characters
      if (username.length > 15) {
        $('#usernameError').html(
          'Your username cannot be more than 15 characters.'
        );
      }

      //Username can't start with a space
      if (username[0] == ' ') {
        if ($('#usernameError').html == '') {
          $('#usernameError').html('Your username cannot start with a space.');
        } else {
          $('#usernameError').html(function(i, originalText) {
            return (
              originalText + '<br>Your username cannot start with a space.'
            );
          });
        }
      }

      //Username can't end with a space
      if (username[username.length - 1] == ' ') {
        if ($('#usernameError').html == '') {
          $('#usernameError').html('Your username cannot end with a space.');
        } else {
          $('#usernameError').html(function(i, originalText) {
            return originalText + '<br>Your username cannot end with a space.';
          });
        }
      }

      //Age can't be blank
      if (age == '') {
        $('#ageError').html('Your age cannot be blank.');
      }
      //Age can't be more than 3 numbers
      if (age.length > 3) {
        $('#ageError').html('Your age cannot be more than 3 numbers.');
      }

      //Color can't be too close to white
      if (
        $('#range1').val() > 220 &&
        $('#range2').val() > 220 &&
        $('#range3').val() > 220
      ) {
        $('#colorError').html('Your color is too close to white.');
      }

      //When fields were entered correctly
      if (
        $('#usernameError').html() == '' &&
        $('#ageError').html() == '' &&
        $('#colorError').html() == ''
      ) {
        pingServer();
        $('#userInfoModal').remove();
        $('#chatBox').show(500);
        $('#usernamePrepend').html(username);
      } else {
        e.preventDefault();
      }
    });
  }

  //Used to send messages to client from the client
  function sendMessageToClientFromClient() {
    numOfMessages++;
    message = $('#message')
      .val()
      .trim();
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let currentdate = new Date();
    currentHour = currentdate.getHours();
    currentMinute = currentdate.getMinutes();
    theM;

    if (currentHour > 12) {
      theM = 'PM';
      currentHour -= 12;
    } else if (currentHour == 12) {
      theM = 'PM';
    } else {
      theM = 'AM';
    }

    if (currentHour == 0) {
      currentHour = 12;
    }

    if (currentMinute < 10) {
      currentMinute = '0' + currentMinute;
    }

    let colorHtml =
      'style="color:rgb(' +
      colorValues[0] +
      ', ' +
      colorValues[1] +
      ', ' +
      colorValues[2] +
      ');"';
    let additionalMessage =
      '<div ' +
      colorHtml +
      ' class="d-flex">' +
      '<span class="font-weight-bold pr-1">' +
      username +
      '</span>' +
      '<span>' +
      message +
      '</span>' +
      '<span class="font-italic ml-auto pl-1">' +
      currentHour +
      ':' +
      currentMinute +
      ' ' +
      theM +
      '</span>' +
      '</div>';
    $('#content').append(additionalMessage);
    $('#message').val('');

    //Scrolls content down automatically
    $('#content').animate(
      { scrollTop: $('#content').prop('scrollHeight') },
      500
    );
  }

  //Used to display info from server on the client
  function sendMessageToClientFromServer(
    userName,
    message,
    hour,
    minute,
    theM,
    r,
    g,
    b
  ) {
    numOfMessages++;

    username = username.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let colorHtml = 'style="color:rgb(' + r + ', ' + g + ', ' + b + ');"';
    let additionalMessage =
      '<div ' +
      colorHtml +
      ' class="d-flex">' +
      '<span class="font-weight-bold pr-1">' +
      userName +
      '</span>' +
      '<span>' +
      message +
      '</span>' +
      '<span class="font-italic ml-auto pl-1">' +
      hour +
      ':' +
      minute +
      ' ' +
      theM +
      '</span>' +
      '</div>';
    $('#content').append(additionalMessage);
  }

  function sendMessageToServer() {
    $.ajax({
      url: 'PHP/addUserToDB.php',
      type: 'POST',
      data: {
        userName: username,
        age: age,
        message: message,
        timeHour: currentHour,
        timeMinute: currentMinute,
        theM: theM,
        r: colorValues[0],
        g: colorValues[1],
        b: colorValues[2]
      },

      success: function(output) {
        if (output == 'Error!') {
          alert(output);
        }
      }
    });
  }

  //Event listeners for various buttons
  function eventListeners() {
    //Updates the example text on range value update
    $('input[type=range]').on('input', function() {
      $('#exampleText').css(
        'color',
        'rgb(' +
          $('#range1').val() +
          ', ' +
          $('#range2').val() +
          ', ' +
          $('#range3').val() +
          ')'
      );
    });

    //Event listener for when 'send' button is clicked
    $('#send').click(function() {
      //Send message if it's not empty
      if (
        !$('#message')
          .val()
          .trim() == ''
      ) {
        sendMessageToClientFromClient();
        sendMessageToServer();
      }
    });

    //Event listener for when the 'enter' key is pressed to send message
    $('#message').keypress(function(e) {
      if (e.keyCode == 13) {
        if (
          !$('#message')
            .val()
            .trim() == ''
        ) {
          sendMessageToClientFromClient();
          sendMessageToServer();
        }
      }
    });
  }

  //Pings server to check if there are new messages to show
  function pingServer() {
    $.ajax({
      url: 'PHP/checkMessages.php',
      type: 'POST',
      data: {
        numOfMessages: numOfMessages
      },

      success: function(output) {
        //If server has messages to send to client
        if (output != 'Up to date') {
          let parsedResult = output.split('!!ee!!');
          let count = parsedResult[0] * 9 - parsedResult[0];
          let i = 0;
          let data = [];

          while (count >= 0) {
            data[i] = parsedResult[count];
            i++;
            count--;
          }

          for (i = 0; i < 8 * parsedResult[0]; i += 8) {
            let name = data[i + 7];
            let msg = data[i + 6];
            let hour = data[i + 5];
            let min = data[i + 4];
            let theMM = data[i + 3];
            let r = data[i + 2];
            let g = data[i + 1];
            let b = data[i];

            sendMessageToClientFromServer(name, msg, hour, min, theMM, r, g, b);
          }

          //Scrolls content down automatically
          $('#content').animate(
            { scrollTop: $('#content').prop('scrollHeight') },
            500
          );
        }

        //Pings server after 1 second
        setTimeout(pingServer, 1000);
      }
    });
  }

  //Clears messages from database if the day has changed
  function mayClearDatabase() {
    $.post('PHP/checkDatabaseTime.php', function(data) {
      //Sends an alert if there was an error
      if (data != '') {
        alert(data);
      }
    });
  }

  //Checks if date changed. If it does, messages on client/server are cleared.
  function dateChecker() {
    let ddate = new Date();
    ddate.toLocaleString('de-DE', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'America/New_York'
    });
    let newDate =
      ddate.getFullYear() +
      '-' +
      (ddate.getMonth() + 1) +
      '-' +
      ddate.getDate();

    if (oldDate != newDate) {
      oldDate = newDate;
      setTimeout(mayClearDatabase, 5000);
      setTimeout(function() {
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

    //Checks again after 1 second
    setTimeout(dateChecker, 1000);
  }
});
