// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



function LevelDirector()
{
   this.myCurrentLevel = 1;
   this.myCurrentWave = 0;
   this.mySorties = null;
   this.myClock = 0;
   this.myGameOverClock = 0;
   this.myFleetBonus = 0;

   this.myBonusSequence = false;
   this.myWaveBonuses = new Array( 5000, 10000, 20000 );
   this.myShipsPerWave = new Array( 24, 24, 24 );

   this.mySpecialText = null;

   this.myBoss = null;
   this.myEOLLives = 2;
   this.myEOLScore = 0;
}

LevelDirector.prototype.startLevel = function()
{
   g_powerups = new Array();
   g_floatyText = new Array();
   g_projectiles = new Array();
   g_enemyProjectiles = new Array();
   g_enemies = new Array();
   g_afterEffects = new Array();

   this.resetBonus();

   if ( g_gameState != "setup" )
   {
      dbg("level director setup error", false);
      return;
   }

   if ( this.myCurrentLevel == 1 )
   {
      g_background = new Background("starfield", 1);
      g_foreground = new Background("foreground", 2);

      startLevel2Loop("terminate"); //TEMP

      var intro = document.getElementById("level_1_preloop");
      intro.volume = 1;
      intro.play();
      intro.addEventListener("ended", start_level_1_loop, true);
      g_ship = new Ship(2,0);
      g_gameState = "inlevel";
   }
   else if ( this.myCurrentLevel == 3 )
   {
      g_background = new Background("sky", 1);
      g_foreground = new Background("foreground_light", 2);
      startLevel2Loop();
      g_ship = new Ship(this.myEOLLives,this.myEOLScore);
      g_gameState = "inlevel";
   }

   this.initSorties();

   g_renderInterval = setInterval(renderLoop, 1000/24);
   g_clockInterval = setInterval(clockLoop, 100);
}

LevelDirector.prototype.resetBonus = function()
{
   g_shotsRequired = 0;
   g_shotsFired = 0;
   g_accuracy = 0;
   g_enemiesDestroyed = 0;
   g_showAccuracy = false;

   this.myFleetBonus = 0;
}

LevelDirector.prototype.dropSpecial = function(x,y,name)
{
   var p = null;

   var velx = -3;
   var vely = 0;

   var  speed_onscreen = 0;
   var   shot_onscreen = 0;
   var double_onscreen = 0;
   var    gun_onscreen = 0;

   //
   // count onscreen powerups so that we don't drop duplicates, although there
   // is other code in the applyEffect() method of Powerup to award points
   // instead of powering the ship beyond it's highest capability
   //
   for (var i = 0; i < g_powerups.length; ++i)
   {
      if ( g_powerups[i].myName == "speed" )
         speed_onscreen++;
      else if ( g_powerups[i].myName == "shot" )
         shot_onscreen++;
      else if ( g_powerups[i].myName == "double" )
         double_onscreen++;
      else if ( g_powerups[i].myName == "gun" )
         gun_onscreen++;
   }

   if ( g_ship.myWeapon.myName == "laser" && this.myClock < 54000 )
   {
      double_onscreen = 99;
   }

   if ( name == undefined )
   {
      if ((g_ship.myVelocity < 5) && (speed_onscreen < 5-g_ship.myVelocity))
      {
         p = new Powerup("speed", x, y, velx, vely);
      }
      else if ((g_ship.myWeapon.myMaxOnScreen < 5) &&
                           (shot_onscreen < 5 - g_ship.myWeapon.myMaxOnScreen ))
      {
         p = new Powerup("shot", x, y, velx, vely);
      }
      else if ( !g_ship.myWeapon.myDoubled && !double_onscreen )
      {
         p = new Powerup("double", x, y, velx, vely);
      }
      else if ( g_ship.myWeapon.myName != "laser" && !gun_onscreen)
      {
         p = new Powerup("gun", x, y, velx, vely);
      }
   }
   else
   {
      p = new Powerup(name, x, y, velx, vely);
   }

   if ( p!= null)
      g_powerups.push( p );
   else
      g_powerups.push( new Powerup("gem", x, y, velx, vely) );
      
   //console.info("LevelDirector info: no powerup created.");
}

LevelDirector.prototype.renderSpecialText = function()
{
   if ( this.mySpecialText == null )
   {
      return;
   }

   var metrics = g_context.measureText(this.mySpecialText);
   g_context.fillStyle = "yellow";
   g_context.fillText(this.mySpecialText, 
                            g_canvas.width/2 - metrics.width/2, 200);
}

LevelDirector.prototype.launchSorties = function()
{
   var lastEnemyLaunched = null;

   for ( var i = 0; i < this.mySorties.length; ++i )
   {
      if ( this.mySorties[i].myLaunchTime == this.myClock )
      {
         lastEnemyLaunched = this.mySorties[i].launch();
      }
   }

   if (lastEnemyLaunched != null )
      if ( lastEnemyLaunched.myBoss )          //boolean
         this.myBoss = lastEnemyLaunched;
}

LevelDirector.prototype.waveBonus = function(maxFleetBonus)
{
      this.myFleetBonus = maxFleetBonus;
      this.myFleetBonus *= g_enemiesDestroyed / 
                                        this.myShipsPerWave[this.myCurrentWave];
      this.myFleetBonus /= 100;
      this.myFleetBonus = Math.floor(this.myFleetBonus);
      this.myFleetBonus *= 100;
      g_ship.myScore += this.myFleetBonus;

      var f = new FloatyText("WAVE BONUS: " + this.myFleetBonus,
                  g_canvas.width / 2 -50, g_canvas.height / 2 - 50, 48);
      g_floatyText.push(f);
      g_bonusSound.play();
}

LevelDirector.prototype.accuracyBonus = function(maxFleetBonus)
{
      if (isNaN(g_accuracy))
         return;
      var accuracyBonus = this.myFleetBonus * g_accuracy;
      if ( g_accuracy >= 1.0 && this.myFleetBonus == maxFleetBonus)
         accuracyBonus *= 2;

      accuracyBonus /= 100;
      accuracyBonus = Math.floor(accuracyBonus);
      accuracyBonus *= 100;

      g_ship.myScore += accuracyBonus;

      var f = new FloatyText("ACCURACY BONUS: " + accuracyBonus,
                  g_canvas.width / 2 -50, g_canvas.height / 2 - 50, 48);
      g_floatyText.push(f);
      g_bonusSound.play();
}


LevelDirector.prototype.gameEvents = function()
{
   if (g_gameState == "game_over")
   {
      if ( this.myGameOverClock == 0 )
      {
         if ( this.myCurrentLevel < 3 )
         {
            var intro = document.getElementById("level_1_preloop");
            intro.removeEventListener("ended", start_level_1_loop, true);
            intro.volume = 0;
            start_level_1_loop("gameover");
            startBossLoop("end_boss");
         }
      }

      this.myGameOverClock+=100;
      this.mySpecialText = "GAME OVER";

      if ( this.myGameOverClock >= 3000 )
      {
         clearInterval(g_clockInterval);
         clearInterval(g_renderInterval);
         if ( g_ship.myScore > g_highScore )
            g_highScore = g_ship.myScore;

         if (g_onscreenControls)
         {
            g_canvas.removeEventListener('mousedown', ev_mousedown, false);
            g_canvas.removeEventListener('mouseup', ev_mouseup, false);
         }

         bodyLoaded(); 
      }
      return;
   }

   if ( this.myCurrentLevel == 1 )
   {
      if ( this.myClock == 27000 || this.myClock == 61000 || 
           this.myClock == 89000)
      {
         this.myBonusSequence = true;
         this.bonusStartTime = this.myClock;
         g_showAccuracy = true;
      }
   
      if (this.myBonusSequence)
      {
         if ( this.myClock == this.bonusStartTime + 2000 )
         {
            this.waveBonus(this.myWaveBonuses[this.myCurrentWave]);
         }
         else if ( this.myClock == this.bonusStartTime + 4000 )
         {
            this.accuracyBonus(this.myWaveBonuses[this.myCurrentWave]);
         }
         else if ( this.myClock == this.bonusStartTime + 6000 )
         {
            this.myCurrentWave++;
            g_showAccuracy = false;
            this.resetBonus();
            this.myBonusSequence = false;
         }
      }
   
      if ( this.myClock == 96500 )
      {
         start_level_1_loop("boss");
         startBossLoop();
         this.mySpecialText = "An alien command ship is approaching!";
      }
   
      if ( this.myClock == 100000 )
      {
         this.mySpecialText = null;
   
         g_ship.myVelocity = 5; 
         this.dropSpecial(600, 200);
         this.dropSpecial(650, 200);
         this.dropSpecial(700, 200);
         this.dropSpecial(750, 200);
   
         g_gameState = "boss";
         this.myCurrentLevel++;
         this.myClock = 0;
         delete this.mySorties;
         this.initSorties();
      }
   }
   else if ( this.myCurrentLevel == 2 )
   {
      if ( g_gameState == "boss_defeated" )
      {
         this.mySpecialText = "Command ship destroyed!";
         startBossLoop("end_boss");
         document.getElementById("level_passed").play();
         g_gameState = "setup";
         delete this.mySorties;
         this.mySorties = new Array();
         this.myClock = 0;
         document.removeEventListener('keydown', keyDown, false);
         document.removeEventListener('keyup', keyUp, false);
         g_ship.myUp = false;
         g_ship.myDown = false;
         g_ship.myLeft = false;
         g_ship.myRight = false;
         g_ship.myFiring = false;
      }
      else if (g_gameState == "setup" )
      {
         if (this.myClock == 4000)
            this.mySpecialText = null;
         if (this.myClock == 5000)
            g_ship.myVelX = 15;
         if (this.myClock == 6000)
            g_ship.myVisible = false;
         if (this.myClock == 9000)
         {
            this.myCurrentLevel++;
            this.myEOLLives = g_ship.myLives;
            this.myEOLScore = g_ship.myScore;
            document.addEventListener('keydown', keyDown, false);
            document.addEventListener('keyup', keyUp, false);
            clearInterval(g_clockInterval);
            clearInterval(g_renderInterval);
            this.myClock = 0;
            this.startLevel();
         }
      }
      else if ( this.myClock > 10000 )
      {
         if ( this.myClock % 2000 == 0 )
         {
            var s = new EnemyShot("pea", this.myBoss.myX,
                                  this.myBoss.myY + this.myBoss.myHeight/2,
                                  -10, 5 );
            g_enemyProjectiles.push(s);
            var s = new EnemyShot("pea", this.myBoss.myX,
                                  this.myBoss.myY + this.myBoss.myHeight/2,
                                  -10, -5 );
            g_enemyProjectiles.push(s);
            var s = new EnemyShot("pea", this.myBoss.myX,
                                  this.myBoss.myY + this.myBoss.myHeight/2,
                                  -10, 0 );
            g_enemyProjectiles.push(s);

            //dbg("total enemy shots: " + g_enemyProjectiles.length, false);
         }
      }
   }
   else if ( this.myCurrentLevel == 3 )  //L2SORT
   {
      if ( this.myClock < 6000 )
      {
         var secLeft = Math.floor((6000 - this.myClock)/1000);
         this.mySpecialText = "Thanks for playing.   " 
                               + secLeft;
      }
      else if ( this.myClock == 6000 )
      {
         g_gameState = "game_over"; 
      }
      //dbg(this.myClock, false);
   }
}


LevelDirector.prototype.initSorties = function()
{
   this.myBoss = null;
   this.mySorties = new Array();

   if ( this.myCurrentLevel == 1 )
   {
      var sortie = new Sortie(2500);
      sortie.add("enemy_small",         600, 165, -5, 0);
      sortie.add("enemy_small",         625, 125, -5, 0);
      sortie.add("enemy_small",         635, 200, -5, 0);
      sortie.add("enemy_small_special", 670, 165, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(6000);
      sortie.add("enemy_small",         600, 165, -5, 0);
      sortie.add("enemy_small",         635, 125, -5, 0);
      sortie.add("enemy_small",         635, 200, -5, 0);
      sortie.add("enemy_small_special", 670, 165, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(12000);
      sortie.add("enemy_small",         600, 250, -5, 0);
      sortie.add("enemy_small",         645, 250, -5, 0);
      sortie.add("enemy_small",         695, 250, -5, 0);
      sortie.add("enemy_small_special", 740, 250, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(16000);
      sortie.add("enemy_small",           600, 200, -5, 0);
      sortie.add("enemy_small",           645, 170, -5, 0);
      sortie.add("enemy_small",           645, 230, -5, 0);
      sortie.add("enemy_small_2",         690, 170, -5, 0);
      sortie.add("enemy_small_2",         690, 230, -5, 0);
      sortie.add("enemy_small_2_special", 740, 200, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(20000);
      sortie.add("enemy_small",           600,  150, -5, 0);
      sortie.add("enemy_small",           645,  120, -5, 0);
      sortie.add("enemy_small",           645,  180, -5, 0);
      sortie.add("enemy_small_2",         690,  120, -5, 0);
      sortie.add("enemy_small_2",         690,  180, -5, 0);
      sortie.add("enemy_small_2_special", 740,  150, -5, 0);
      this.mySorties.push(sortie);

      // break, bonus event

      sortie = new Sortie(33500);
      sortie.add("enemy_small_3",         600,  200, -5, 0);
      sortie.add("enemy_small_3",         600,  235, -5, 0);
      sortie.add("enemy_small_3",         655,  190, -5, 0);
      sortie.add("enemy_small_3",         655,  245, -5, 0);
      sortie.add("enemy_small_2_special", 700,  219, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(39000);
      sortie.add("enemy_small_2",         600, 250, -5, 0);
      sortie.add("enemy_small_2",         645, 250, -5, 0);
      sortie.add("enemy_small_2",         695, 250, -5, 0);
      sortie.add("enemy_small_2_special", 740, 250, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(43000);
      sortie.add("enemy_small_3",         600,  0, -7, 1);
      sortie.add("enemy_small_3",         655,  0, -7, 1);
      sortie.add("enemy_small_3",         710,  0, -7, 1);
      sortie.add("enemy_artifact",        765,  0, -7, 1);
      this.mySorties.push(sortie);

      sortie = new Sortie(49000);
      sortie.add("enemy_small_special",         600,  60,   -6, 2);
      sortie.add("enemy_small_special",         600,  100, -6, 2);
      sortie.add("enemy_small_special",         600,  340, -6, -2);
      sortie.add("enemy_small_special",         600,  400, -6, -2);
      this.mySorties.push(sortie);

      sortie = new Sortie(54000);
      sortie.add("enemy_small",               600,  150, -6, 0);
      sortie.add("enemy_small",               600,  200, -6, 0);
      sortie.add("enemy_small",               640,  150, -6, 0);
      sortie.add("enemy_small",               640,  200, -6, 0);
      sortie.add("enemy_small_3",             680,  150, -6, 0);
      sortie.add("enemy_small_3",             680,  200, -6, 0);
      sortie.add("enemy_small_2_special",     760,  175, -6, 0);
      this.mySorties.push(sortie);

      // break, bonus event

      sortie = new Sortie(67500);
      sortie.add("enemy_small_2_special", 600,  180, -5, 0);
      sortie.add("enemy_small_2_special", 650,  220, -5, 0);
      sortie.add("enemy_small_2_special", 700,  180, -5, 0);
      sortie.add("enemy_small_2_special", 750,  220, -5, 0);
      sortie.add("enemy_small_2_special", 800,  180, -5, 0);
      sortie.add("enemy_small_2_special", 850,  220, -5, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(73500);
      sortie.add("enemy_small_4",   700,  170, -4, 0);
      sortie.add("enemy_small_4",   700,  220, -4, 0);
      sortie.add("enemy_artifact_2",750,  195, -4, 0);
      sortie.add("enemy_small_4",   600,  0,   -5, 2);
      sortie.add("enemy_small_4",   600,  40,  -5, 2);
      sortie.add("enemy_small_4",   600,  350, -5, -2);
      sortie.add("enemy_small_4",   600,  390, -5, -2);
      this.mySorties.push(sortie);

      sortie = new Sortie(80500);
      sortie.add("enemy_small_4", 600,  180, -7, 1);
      sortie.add("enemy_small_4", 650,  220, -7, -1);
      sortie.add("enemy_small_4", 700,  180, -7, 1);
      sortie.add("enemy_small_4", 750,  220, -7, -1);
      sortie.add("enemy_small_4", 800,  180, -7, 1);
      sortie.add("enemy_small_4_special", 850,  220, -7, -1);
      this.mySorties.push(sortie);

      sortie = new Sortie(85000);
      sortie.add("enemy_small", 600,  180, -10,   0);
      sortie.add("enemy_small", 600,  220, -10,   0);
      sortie.add("enemy_small", 650,  180, -10,   0);
      sortie.add("enemy_small", 650,  220, -10,   0);
      sortie.add("enemy_small_3", 700,  200, -10, 0);
      this.mySorties.push(sortie);


// testing code
/*
      g_ship.myWeapon = new Laser();
      g_ship.myWeapon.myDoubled = true;
      g_ship.myWeapon.myMaxOnScreen = 5;
      g_ship.myVelocity = 5;
      this.myClock = 96400;
*/


   }
   else if ( this.myCurrentLevel == 2 )
   {
      var sortie = new Sortie(6000);
      sortie.add("enemy_small_4",         600, 0,  -7, 3);
      sortie.add("enemy_small_4",         640, 0,  -7, 3);
      sortie.add("enemy_small_4",         600, 40, -7, 3);
      sortie.add("enemy_small_4",         640, 40, -7, 3);

      sortie.add("enemy_small_4",         600, 360, -7, -3);
      sortie.add("enemy_small_4",         640, 360, -7, -3);
      sortie.add("enemy_small_4",         600, 400, -7, -3);
      sortie.add("enemy_small_4",         640, 400, -7, -3);
      this.mySorties.push(sortie);

      sortie = new Sortie(7000);
      sortie.add("enemy_small_2",         600, 175, -7, 0);
      sortie.add("enemy_small_2",         600, 225, -7, 0);
      sortie.add("enemy_small_2",         640, 175, -7, 0);
      sortie.add("enemy_small_2",         640, 225, -7, 0);
      sortie.add("enemy_small_3",         640, 175, -3, 0);
      sortie.add("enemy_small_3",         640, 225, -3, 0);
      sortie.add("enemy_small_3",         680, 175, -3, 0);
      sortie.add("enemy_small_3",         680, 225, -3, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(9000);
      sortie.add("command_ship",          600, 175, -2, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(11000);
      sortie.add("enemy_small",         600, 100, -10, 0);
      sortie.add("enemy_small",         640, 100, -10, 0);
      sortie.add("enemy_small",         680, 100, -10, 0);
      sortie.add("enemy_small",         720, 100, -10, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(16000);
      sortie.add("enemy_small",         600, 300, -10, 0);
      sortie.add("enemy_small",         640, 300, -10, 0);
      sortie.add("enemy_small",         680, 300, -10, 0);
      sortie.add("enemy_small",         720, 300, -10, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(26000);
      sortie.add("enemy_small_special",         600, 100, -10, 0);
      sortie.add("enemy_small_special",         640, 100, -10, 0);
      sortie.add("enemy_small_special",         680, 100, -10, 0);
      this.mySorties.push(sortie);

      sortie = new Sortie(41000);
      sortie.add("enemy_small_special",         600, 300, -10, 0);
      sortie.add("enemy_small_special",         640, 300, -10, 0);
      sortie.add("enemy_small_special",         680, 300, -10, 0);
      this.mySorties.push(sortie);
   }
}

