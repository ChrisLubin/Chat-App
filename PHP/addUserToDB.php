<?php
  // Do not change the following two lines.
  $teamURL = dirname($_SERVER['PHP_SELF']) . DIRECTORY_SEPARATOR;
  $server_root = dirname($_SERVER['PHP_SELF']);

  // You will need to require this file on EVERY php file that uses the database.
  // Be sure to use $db->close(); at the end of each php file that includes this!

  $dbhost = 'localhost';  // Most likely will not need to be changed
  $dbname = '';   // Needs to be changed to your designated table database name
  $dbuser = '';   // Needs to be changed to reflect your LAMP server credentials
  $dbpass = ''; // Needs to be changed to reflect your LAMP server credentials

  $db = new mysqli($dbhost, $dbuser, $dbpass, $dbname);

  if($db->connect_errno > 0) {
      echo "Unable to connect";
      die('Unable to connect to database [' . $db->connect_error . ']');
  }

  $userName = mysqli_real_escape_string($db, $_POST['userName']);
  $age = mysqli_real_escape_string($db, $_POST['age']);
  $message = mysqli_real_escape_string($db, $_POST['message']);
  $timeHour = $_POST['timeHour'];
  $timeMinute = $_POST['timeMinute'];
  $theM = $_POST['theM'];
  $r = $_POST['r'];
  $g = $_POST['g'];
  $b = $_POST['b'];

  $sql = "INSERT INTO Messages (userName, age, message, timeHour, timeMinute, theM, r, g, b)
  VALUES('$userName', $age, '$message', $timeHour, '$timeMinute', '$theM', $r, $g, $b)";

  if ($db->query($sql) != TRUE) {
    echo "Error!";
  }

  $db->close();
?>