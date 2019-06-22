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

date_default_timezone_set('America/New_York');
$currentDate = date('Y-m-d', time());

$result = mysqli_query($db, "SELECT Date FROM MessagesClearDaily");
$row = mysqli_fetch_assoc($result);
$tableDate = $row['Date'];

if($currentDate != $tableDate) {
  //Updates the date in the table
  $sql = "UPDATE MessagesClearDaily SET Date = '$currentDate'";
  if ($db->query($sql) != TRUE) {
    echo "Unable to update the date in the table!";
  }

  //Clears the messages in the messages table
  $sql = "TRUNCATE TABLE Messages";
  if ($db->query($sql) != TRUE) {
    echo "Unable to clear the messages in the database!";
  }

  //Adds admin message
  $userName = 'Admin';
  $age = 99;
  $message = mysqli_real_escape_string($db, 'The messages in this chat are reset everyday.');
  $timeHour = 12;
  $timeMinute = '00';
  $theM = 'AM';
  $r = 19;
  $g = 147;
  $b = 251;

  $sql = "INSERT INTO Messages (userName, age, message, timeHour, timeMinute, theM, r, g, b)
  VALUES('$userName', $age, '$message', $timeHour, '$timeMinute', '$theM', $r, $g, $b)";

  if ($db->query($sql) != TRUE) {
    echo "Unable to add admin message!";
  }
}

$db->close();
?>