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

  if ($db->connect_errno > 0) {
      echo "Unable to connect";
      die('Unable to connect to database [' . $db->connect_error . ']');
  }

  $clientMessages = $_POST['numOfMessages'];
  $serverMessages;

  $sql = "SELECT id FROM Messages ORDER BY id DESC LIMIT 1";

  $result = mysqli_query($db, $sql);
  if (mysqli_num_rows($result) > 0) {
    $id = mysqli_fetch_row($result);
    $serverMessages = $id[0];
  }

  if ($clientMessages < $serverMessages) {
    $limit = $serverMessages - $clientMessages;
    $messages = array();
    if ($clientMessages == 0) {
      $sql = "SELECT * FROM Messages ORDER BY id ASC LIMIT $limit";
    } else {
      $sql = "SELECT * FROM Messages ORDER BY id DESC LIMIT $limit";
    }

    $result = mysqli_query($db, $sql);
    if (mysqli_num_rows($result) > 0) {
    // Output data of each row
      while ($row = mysqli_fetch_assoc($result)) {
        $messages[] = array(
          'username' => $row['userName'],
          'message' => $row['message'],
          'hour' => $row['timeHour'],
          'minute' => $row['timeMinute'],
          'theM' => $row['theM'],
          'r' => $row['r'],
          'g' => $row['g'],
          'b' => $row['b']
        );
      }

      echo json_encode($messages, JSON_PRETTY_PRINT);
    }
  } else {
    echo json_encode('Up to date', JSON_PRETTY_PRINT);
  }

  $db->close();
?>
