<?php

if (!isset($_SESSION)) {
    session_start();
}

include 'dbcon.php';



$_SESSION['click_win'] = $_GET['click'];


$sql_credit = $sqlite->prepare("SELECT * FROM users WHERE id=:id");
$sql_credit->execute(array('id' => $_SESSION['baccarat']['id']));
$rs_credit = $sql_credit->fetch(PDO::FETCH_ASSOC);


if ($rs_credit['credit'] == 0) {
    echo '{          
              "credit":"0"
     }';
} else {
    $click = $_GET['click'];

    if ($_POST['data'] == 'resetHistory') {

        $h_win = $_SESSION['h_win'];
        $h_lose = $_SESSION['h_lose'];
        if ($h_win == '') {
            $h_win = '0';
        }
        if ($h_lose == '') {
            $h_lose = '0';
        }

        $sql_history = $sqlite->prepare("UPDATE  statistic set 
            status=:status
            WHERE user=:user AND status='1'
            ");
        $sql_history->execute(array(
            ':status' => '0',
            ':user' => $_SESSION['baccarat']['id']
        ));
        if ($sql_history) {
            $sql_statistic_all = "INSERT INTO statistic_all(
        user,
        win,
        lose,
        date
        )VALUES(
        :user,
        :win,
        :lose,
        :date
        )";
            $result_statistic_all = $sqlite->prepare($sql_statistic_all);
            $result_statistic_all->execute(array(
                ':user' => $_SESSION['baccarat']['id'],
                ':win' => $h_win,
                ':lose' => $h_lose,
                ':date' => date('Y-m-d')
            ));

            unset($_SESSION['h_win']);
            unset($_SESSION['h_lose']);
            unset($_SESSION['click']);
            unset($_SESSION['point']);
            unset($_SESSION['clickCount']);
            unset($_SESSION['clickWin']);
        }
    }

  


    if ($_POST['data'] == 'resetTable') {
        unset($_SESSION['click']);
        unset($_SESSION['point']);
        unset($_SESSION['clickCount']);
        unset($_SESSION['clickWin']);
        unset($_SESSION['result']);
    }

//แพ้
    if (empty($_SESSION['click'])) {
        $clickUpdate = $click;
        $_SESSION['click'] = $clickUpdate;
    } else {
        $clickUpdate = $_SESSION['click'] . $click;
        $_SESSION['click'] = $clickUpdate;
    }

    
    
   if ($_POST['data'] == 'undoBall') {
        $undo = substr($_SESSION['click'], 0, -1);
        $_SESSION['click'] = $undo;
    }
    
    
    

//เช็คสูตร
//ตัดเอาแค่ 6
    if (strlen($_SESSION['click']) > 6) {
        $click_new = substr($_SESSION['click'], 1, 6);
        $_SESSION['click'] = $click_new;
    }

//น้ำเงิน
    if ($_SESSION['click'] == 'PPPPPP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBPBBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBBPBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BPPPPP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PPPPBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PPPPPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BPPBBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBPPBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBBPPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BPBPBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBPBPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBBPBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBBBBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBPPPP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PPPBBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PPPPBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBPPBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PPBPPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BPPPBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBBBPP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBPBPP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PPBBPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBPBBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BPPBPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BPPBBP') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'BBPPPB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBPPBB') {
        $point = 'P';
    } elseif ($_SESSION['click'] == 'PBPBPB') {
        $point = 'P';		
    }

//แดง
    if ($_SESSION['click'] == 'BBBBBB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PBBBBB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BBBBPB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BBBBBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPBPPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPPBPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPBBBB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BBBBPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPBBPB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BBPBBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PBBBPB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPBBBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PBBPPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPBBPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PBPBPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPBPBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPPBPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPPPPB') {
        $point = 'B';	
    } elseif ($_SESSION['click'] == 'BBBPPP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPBBBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PBBPBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPBBPP') {
        $point = 'B';	
    } elseif ($_SESSION['click'] == 'BBPPBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPBPBP') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPPPBB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPPBBB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'PPBPBB') {
        $point = 'B';
    } elseif ($_SESSION['click'] == 'BPBPPB') {
        $point = 'B';	
    } elseif ($_SESSION['click'] == 'PBPBPB') {
        $point = 'B';		
    }








//    echo $_SESSION['click'];





    if (!empty($point)) {
//WIN
        if ($click == $_SESSION['point']) {
            $result = 'WIN';
            $sql_statistic = "INSERT INTO statistic(
        user,
        date,
        count,
        ball,
        result,
        status
        )VALUES(
        :user,
        :date,
        :count,
        :ball,
        :result,
        :status
        )";
            $result_statistic = $sqlite->prepare($sql_statistic);
            $result_statistic->execute(array(
                ':user' => $_SESSION['baccarat']['id'],
                ':date' => date('Y-m-d'),
                ':count' => $_SESSION['clickWin'],
                ':ball' => $_SESSION['click'],
                ':result' => $result,
                ':status' => '1'
            ));

            $sql_last_login = "UPDATE  users SET credit=credit-:credit WHERE id=:id";
            $result_last_login = $sqlite->prepare($sql_last_login);
            $result_last_login->execute(array(
                'credit' => 1,
                'id' => $_SESSION['baccarat']['id']
            ));


            $_SESSION['clickWin'] = 1;
//LOSE
        } else {
            if (!isset($_SESSION['clickWin'])) {
                $clickWin = 1;
                $_SESSION['clickWin'] = $clickWin;
            } else {
                $clickWin = $_SESSION['clickWin'] + 1;
                $_SESSION['clickWin'] = $clickWin;
            }

            if ($_SESSION['clickWin'] > 3) {
                $result = 'LOSE';
                $sql_statistic = "INSERT INTO statistic(
                user,
                date,
                count,
                ball,
                result,
                status
                )VALUES(
                :user,
                :date,
                :count,
                :ball,
                :result,
                :status
            )";
                $result_statistic = $sqlite->prepare($sql_statistic);
                $result_statistic->execute(array(
                    ':user' => $_SESSION['baccarat']['id'],
                    ':date' => date('Y-m-d'),
                    ':count' => $_SESSION['clickWin'],
                    ':ball' => $_SESSION['click'],
                    ':result' => $result,
                    'status' => '1'
                ));
                $_SESSION['clickWin'] = 1;
            }
        }
    } else {
        //WIN
        if ($click == $_SESSION['point']) {
            $result = 'WIN';

            $sql_statistic = "INSERT INTO statistic(
        user,
        date,
        count,
        ball,
        result,
        status
        )VALUES(
        :user,
        :date,
        :count,
        :ball,
        :result,
        :status
        )";
            $result_statistic = $sqlite->prepare($sql_statistic);
            $result_statistic->execute(array(
                ':user' => $_SESSION['baccarat']['id'],
                ':date' => date('Y-m-d'),
                ':count' => $_SESSION['clickWin'],
                ':ball' => $_SESSION['click'],
                ':result' => $result,
                ':status' => '1'
            ));

            $sql_last_login = "UPDATE  users SET credit=credit-:credit WHERE id=:id";
            $result_last_login = $sqlite->prepare($sql_last_login);
            $result_last_login->execute(array(
                'credit' => 1,
                'id' => $_SESSION['baccarat']['id']
            ));

            unset($_SESSION['clickWin']);
//LOSE
        } else {

            if ($_SESSION['clickWin'] == 3) {
                $result = 'LOSE';
                $sql_statistic = "INSERT INTO statistic(
                user,
                date,
                count,
                ball,
                result,
                status
                )VALUES(
                :user,
                :date,
                :ball,
                :count,
                :result,
                :status
               )";
                $result_statistic = $sqlite->prepare($sql_statistic);
                $result_statistic->execute(array(
                    ':user' => $_SESSION['baccarat']['id'],
                    ':date' => date('Y-m-d'),
                    ':ball' => $_SESSION['click'],
                    ':count' => $_SESSION['clickWin'],
                    ':result' => $result,
                    ':status' => '1'
                ));

                unset($_SESSION['clickWin']);
            }
        }
    }

 

    $_SESSION['result'] = $result;
    $_SESSION['point'] = $point;

//ไม้ที่เข้าสูตร $clickWin

    echo '{
            "clickWin":"' . $_SESSION['clickWin'] . '",
            "point":"' . $_SESSION['point'] . '",            
            "result":"' . $_SESSION['result'] . '"
           
     }';
}
