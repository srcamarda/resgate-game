function start() {
    $("#start").hide();

    $("#gameBG").append("<div id='player' class='animPlayer'></div>");
    $("#gameBG").append("<div id='enemy1' class='animEnemy1'></div>");
    $("#gameBG").append("<div id='enemy2' class='animEnemy2'></div>");
    $("#gameBG").append("<div id='friend' class='animFriend'></div>");
    $("#gameBG").append("<div id='score'></div>");
    $("#gameBG").append("<div id='energy'></div>");

    //Variables
    var game = {};
    var KEY = { W: 87, S: 83, D: 68 };
    var speed = 5;
    var positionY = parseInt(Math.random() * 334);
    var canShoot = true;
    var endGame = false;
    var points = 0;
    var pointsLast = 0;
    var saved = 0;
    var lost = 0;
    var energyNow = 3;

    //Sounds
    var soundShot = document.getElementById("soundShot");
    var soundExplosion = document.getElementById("soundExplosion");
    var soundMusicBG = document.getElementById("soundMusicBG");
    var soundGameOver = document.getElementById("soundGameOver");
    var soundLost = document.getElementById("soundLost");
    var soundRescue = document.getElementById("soundRescue");
    var soundCrash = document.getElementById("soundCrash");

    //Music loop
    soundMusicBG.addEventListener(
        "ended",
        function () {
            soundMusicBG.currentTime = 0;
            soundMusicBG.play();
        },
        false
    );
    soundMusicBG.play();

    game.timer = setInterval(loop, 30);
    game.pressed = [];

    //Key press
    $(document).keydown(function (e) {
        game.pressed[e.which] = true;
    });

    $(document).keyup(function (e) {
        game.pressed[e.which] = false;
    });

    //Game loop
    function loop() {
        moveBG();
        movePlayer();
        moveEnemy1();
        moveEnemy2();
        moveFriend();
        gameCollision();
        score();
        energy();
        setSpeed();
    }

    //Background move
    function moveBG() {
        left = parseInt($("#gameBG").css("background-position"));
        $("#gameBG").css("background-position", left - 1);
    }

    //Player move
    function movePlayer() {
        if (game.pressed[KEY.W]) {
            var positionTop = parseInt($("#player").css("top"));
            if (positionTop - 10 < 3) {
                $("#player").css("top", 3);
            } else {
                $("#player").css("top", positionTop - 10);
            }
        }

        if (game.pressed[KEY.S]) {
            var positionTop = parseInt($("#player").css("top"));
            if (positionTop + 10 > 434) {
                $("#player").css("top", 434);
            } else {
                $("#player").css("top", positionTop + 10);
            }
        }

        if (game.pressed[KEY.D]) {
            shoot();
        }
    }

    function moveEnemy1() {
        positionX = parseInt($("#enemy1").css("left"));
        $("#enemy1").css("left", positionX - speed);
        $("#enemy1").css("top", positionY);

        if (positionX <= 0) {
            positionY = parseInt(Math.random() * 334);
            $("#enemy1").css("left", 745);
            $("#enemy1").css("top", positionY);
        }
    }

    function moveEnemy2() {
        positionX = parseInt($("#enemy2").css("left"));
        $("#enemy2").css("left", positionX - (speed - 2));

        if (positionX <= 0) {
            $("#enemy2").css("left", 845);
        }
    }

    function moveFriend() {
        positionX = parseInt($("#friend").css("left"));
        $("#friend").css("left", positionX + 1);

        if (positionX > 950) {
            $("#friend").css("left", 0);
        }
    }

    function shoot() {
        if (canShoot == true) {
            soundShot.play();
            canShoot = false;

            positionTop = parseInt($("#player").css("top"));
            positionX = parseInt($("#player").css("left"));
            shotX = positionX + 194;
            shotTop = positionTop + 42;
            $("#gameBG").append("<div id='shot'></div");
            $("#shot").css("top", shotTop);
            $("#shot").css("left", shotX);

            var timeShot = window.setInterval(doShoot, 30);
        }

        function doShoot() {
            positionX = parseInt($("#shot").css("left"));
            $("#shot").css("left", positionX + 15);

            if (positionX >= 950) {
                window.clearInterval(timeShot);
                timeShot = null;
                $("#shot").remove();
                canShoot = true;
            }
        }
    }

    function gameCollision() {
        var collision1 = $("#player").collision($("#enemy1"));
        var collision2 = $("#player").collision($("#enemy2"));
        var collision3 = $("#shot").collision($("#enemy1"));
        var collision4 = $("#shot").collision($("#enemy2"));
        var collision5 = $("#player").collision($("#friend"));
        var collision6 = $("#enemy2").collision($("#friend"));

        //Player + enemy1
        if (collision1.length > 0) {
            soundCrash.play();

            enemy1X = parseInt($("#enemy1").css("left"));
            enemy1Y = parseInt($("#enemy1").css("top"));
            explosion1(enemy1X, enemy1Y);

            reviveEnemy1();

            energyNow--;
        }

        //Player + enemy2
        if (collision2.length > 0) {
            soundCrash.play();

            enemy2X = parseInt($("#enemy2").css("left"));
            enemy2Y = parseInt($("#enemy2").css("top"));
            explosion2(enemy2X, enemy2Y);

            $("#enemy2").remove();

            reviveEnemy2();

            energyNow--;
        }

        //Shot + enemy1
        if (collision3.length > 0) {
            points = points + 100;

            enemy1X = parseInt($("#enemy1").css("left"));
            enemy1Y = parseInt($("#enemy1").css("top"));
            explosion1(enemy1X, enemy1Y);

            $("#shot").css("left", 1000);

            reviveEnemy1();
        }

        //Shot + enemy2
        if (collision4.length > 0) {
            points = points + 50;

            enemy2X = parseInt($("#enemy2").css("left"));
            enemy2Y = parseInt($("#enemy2").css("top"));
            explosion2(enemy2X, enemy2Y);

            $("#enemy2").remove();
            $("#shot").css("left", 1000);

            reviveEnemy2();
        }

        //Player + friend
        if (collision5.length > 0) {
            soundRescue.play();
            saved++;

            $("#friend").remove();

            reviveFriend();
        }

        //Enemy2 + friend
        if (collision6.length > 0) {
            lost++;

            if (points - 50 >= 0) {
                points = points - 50;
            }
            else {
                points = 0;
            }            

            friendX = parseInt($("#friend").css("left"));
            friendY = parseInt($("#friend").css("top"));
            explosion3(friendX, friendY);

            $("#friend").remove();

            reviveFriend();
        }
    }

    function explosion1(enemy1X, enemy1Y) {
        soundExplosion.play();

        $("#gameBG").append("<div id='explosion1'></div");
        $("#explosion1").css(
            "background-image",
            "url(assets/img/explosion.png)"
        );
        var div = $("#explosion1");
        div.css("top", enemy1Y);
        div.css("left", enemy1X);
        div.animate({ width: 200, opacity: 0 }, "slow");

        var timeExplosion = window.setInterval(removeExplosion, 800);

        function removeExplosion() {
            div.remove();
            window.clearInterval(timeExplosion);
            timeExplosion = null;
        }
    }

    function explosion2(enemy2X, enemy2Y) {
        soundExplosion.play();

        $("#gameBG").append("<div id='explosion2'></div");
        $("#explosion2").css(
            "background-image",
            "url(assets/img/explosion.png)"
        );
        var div2 = $("#explosion2");
        div2.css("top", enemy2Y);
        div2.css("left", enemy2X);
        div2.animate({ width: 200, opacity: 0 }, "slow");

        var timeExplosion2 = window.setInterval(removeExplosion2, 800);

        function removeExplosion2() {
            div2.remove();
            window.clearInterval(timeExplosion2);
            timeExplosion2 = null;
        }
    }

    function explosion3(friendX, friendY) {
        soundLost.play();

        $("#gameBG").append(
            "<div id='explosion3' class='animFriendDeath'></div"
        );
        $("#explosion3").css("top", friendY);
        $("#explosion3").css("left", friendX);
        var timeExplosion3 = window.setInterval(resetExplosion3, 800);
        function resetExplosion3() {
            $("#explosion3").remove();
            window.clearInterval(timeExplosion3);
            timeExplosion3 = null;
        }
    }

    function reviveEnemy1() {
        positionY = parseInt(Math.random() * 334);
        $("#enemy1").css("left", 745);
        $("#enemy1").css("top", positionY);
    }

    function reviveEnemy2() {
        var timeRevive = window.setInterval(reposition, 5000);

        function reposition() {
            window.clearInterval(timeRevive);
            timeRevive = null;

            if (endGame == false) {
                $("#gameBG").append(
                    "<div id='enemy2' class='animEnemy2'></div"
                );
            }
        }
    }

    function reviveFriend() {
        var timeRevive = window.setInterval(reposition6, 6000);

        function reposition6() {
            window.clearInterval(timeRevive);
            timeRevive = null;

            if (endGame == false) {
                $("#gameBG").append(
                    "<div id='friend' class='animFriend'></div>"
                );
            }
        }
    }

    function score() {
        $("#score").html(
            "<h2> Pontos: " +
                points +
                " Salvos: " +
                saved +
                " Perdidos: " +
                lost +
                "</h2>"
        );
    }

    function energy() {
        if (energyNow == 3) {
            $("#energy").css("background-image", "url(assets/img/energy3.png)");
        }

        if (energyNow == 2) {
            $("#energy").css("background-image", "url(assets/img/energy2.png)");
        }

        if (energyNow == 1) {
            $("#energy").css("background-image", "url(assets/img/energy1.png)");
        }

        if (energyNow == 0) {
            $("#energy").css("background-image", "url(assets/img/energy0.png)");

            gameOver();
        }
    }

    function setSpeed() {
        if (points - pointsLast > 500) {
            speed = speed + 0.5;
            pointsLast = points;
        }
    }

    function gameOver() {
        endGame = true;
        soundMusicBG.pause();
        soundGameOver.play();

        window.clearInterval(game.timer);
        game.timer = null;

        $("#player").remove();
        $("#enemy1").remove();
        $("#enemy2").remove();
        $("#friend").remove();

        $("#gameBG").append("<div id='end'></div>");
        $("#end").html(
            "<h1> Game Over </h1><p id='endText'>Sua pontuação foi: " +
                points +
                "</p>" +
                "<div id='restart'><button id='restartButton' onclick=restartGame()>Jogar novamente</button></div>"
        );
    }
}

function restartGame() {
    soundGameOver.pause();
    $("#end").remove();
    start();
}