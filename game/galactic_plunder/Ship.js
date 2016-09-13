//
// The Hero Ship
//

// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



function Ship(lives, score)
{
   this.myDying = false;
   this.myVisible = true;

   this.myX = 10;
   this.myY = 150;

   this.myVelocity = 3;
   this.myVelX = 0;
   this.myVelY = 0;

   this.myCenterFrame = document.getElementById("ship_center");
   this.myIcon        = document.getElementById("ship_icon");
   this.myUpFrames = new Array();
   this.myDownFrames = new Array();
   this.myDeathFrames = new Array();

   this.myUpFrames[0] = document.getElementById("ship_up_1");
   this.myUpFrames[1] = document.getElementById("ship_up_2");
   this.myUpFrames[2] = document.getElementById("ship_up_3");

   this.myDownFrames[0] = document.getElementById("ship_down_1");
   this.myDownFrames[1] = document.getElementById("ship_down_2");
   this.myDownFrames[2] = document.getElementById("ship_down_3");

   this.myDeathFrames[0] = document.getElementById("ship_death_1");
   this.myDeathFrames[1] = document.getElementById("ship_death_2");
   this.myDeathFrames[2] = document.getElementById("ship_death_3");
   this.myDeathFrames[3] = document.getElementById("ship_death_4");
   this.myDeathFrames[4] = document.getElementById("ship_death_5");
   this.myDeathFrames[5] = document.getElementById("ship_death_6");
   this.myDeathFrames[6] = document.getElementById("ship_death_7");

   this.myUp = false;
   this.myDown = false;
   this.myLeft = false;
   this.myRight = false;
   this.myFiring = false;

   this.myImage = this.myCenterFrame;
   this.myWidth = this.myImage.width;
   this.myHeight = this.myImage.height;
   this.myFrameCounter = 0;
   this.myDeathCounter = 0;

   this.myMomentum = 0;

   this.myLives = lives;
   this.myScore = score;
   this.myWeapon = new PeaShooter();
}


Ship.prototype.die = function()
{
   g_explodeSound.play();
   this.myLives--;

   this.myDying = true;
   this.myVisible = false;
   this.myDeathCounter = 0;

   this.myUp = false;
   this.myDown = false;
   this.myLeft = false;
   this.myRight = false;
   this.myFiring = false;

   this.myVelX = 0;
   this.myVelY = 0;
   this.myMomentum = 0;
   this.myFrameCounter = 0;

   if ( this.myWeapon.myDoubled )
   {
      this.myWeapon.myDoubled = false;
      var ae = new AfterEffect("lose_double", this.myX, this.myY, 9, -9);
      g_afterEffects.push(ae);
   }
   else if ( this.myWeapon.myName == "laser" )
   {
      if ( this.myWeapon.myMaxOnScreen > 1 )
      {
         this.myWeapon.myMaxOnScreen--;
         var ae = new AfterEffect("lose_shot", this.myX, this.myY, 9, -9);
         g_afterEffects.push(ae);
      }
      else
      {
         this.myWeapon = new PeaShooter();
         var ae = new AfterEffect("lose_gun", this.myX, this.myY, 9, -9);
         g_afterEffects.push(ae);
      }
   }
   else
   {
      if ( this.myWeapon.myMaxOnScreen > 3 )
      {
         this.myWeapon.myMaxOnScreen--;
         var ae = new AfterEffect("lose_shot", this.myX, this.myY, 9, -9);
         g_afterEffects.push(ae);
      }
      else if ( this.myVelocity > 3 )
      {
         this.myVelocity--;
         var ae = new AfterEffect("lose_speed", this.myX, this.myY, 9, -9);
         g_afterEffects.push(ae);
      }
   }

   if (this.myLives < 0 )
      g_gameState = "game_over";
}

Ship.prototype.render = function()
{
   if ( g_gameState == "game_over" )
      return;

   var shouldDraw = this.myVisible;

   if ( this.myDying )
   {
      if (this.myDeathCounter > 72 )
      {
         this.myDying = false;
      }
      else if ( this.myDeathCounter > 26 )
      {
         this.myImage = this.myCenterFrame;
         this.myVisible = true;
         shouldDraw = this.myDeathCounter % 2;
      }
      else if ( this.myDeathCounter <= 6 )
      {
         this.myImage = this.myDeathFrames[this.myDeathCounter];
         shouldDraw = true;

         if ( this.myDeathCounter == 6 )
         {
            var ae = new AfterEffect("splode", this.myX, this.myY+5,
                                               this.myVelX, this.myVelY);
            g_afterEffects.push(ae);
         }
         if ( this.myDeathCounter == 3 )
         {
            var ae = new AfterEffect("splode", this.myX, this.myY+10,
                                               this.myVelX, this.myVelY);
            g_afterEffects.push(ae);
         }
      }
      this.myDeathCounter++;
   }

   //dbg("up   = " + this.myUp + "<br>", false);
   //dbg("down = " + this.myDown, true);
   if (this.myVisible)
   {
      if ( this.myFiring && this.myWeapon.repeat())
      {
         this.myWeapon.fire();
      }

      if ( this.myUp )
      {
         if ( this.myFrameCounter > 2 )
            this.myFrameCounter = 2;

         this.myImage = this.myUpFrames[this.myFrameCounter];
         this.myMomentum = this.myFrameCounter;
      }
      else if ( this.myDown )
      {
         if ( this.myFrameCounter > 2 )
            this.myFrameCounter = 2;

         this.myImage = this.myDownFrames[this.myFrameCounter];
         this.myMomentum = -1 * this.myFrameCounter;
      }
      else
      {
         this.myMomentum -= this.myMomentum / Math.abs(this.myMomentum);

         if ( this.myMomentum > 0 )
         {
            this.myImage = this.myUpFrames[this.myMomentum];
         }
         else if ( this.myMomentum < 0 )
         {
            this.myImage = this.myDownFrames[Math.abs(this.myMomentum)];
         }
         else
         {
            this.myImage = this.myCenterFrame;
         }
      }
   }
   this.myWidth = this.myImage.width;
   this.myHeight = this.myImage.height;

   if (shouldDraw)
      g_context.drawImage(this.myImage, this.myX, this.myY);

   this.myY += this.myVelY;
   this.myX += this.myVelX;

   if ( this.myX < 0 )
      this.myX = 0;
   if ( this.myY < 30 )
      this.myY = 30;
   if ( this.myX > g_canvas.width - this.myCenterFrame.width )
      this.myX = g_canvas.width - this.myCenterFrame.width;
   if ( this.myY > g_canvas.height - this.myCenterFrame.height - 32 )
      this.myY = g_canvas.height - this.myCenterFrame.height - 32;

   this.renderStatus();
   this.myFrameCounter++;
}

Ship.prototype.renderStatus = function()
{
   g_context.fillStyle = "yellow";

   for (var i = 0; i < this.myLives; i++)
   {
      g_context.drawImage(this.myIcon, 30*i, 5);
      if ( i >= 4 )
      {
         g_context.fillText("+", 30*i, 5);
         break;
      }
   }
   var metrics = g_context.measureText(this.myScore);
   g_context.fillText(this.myScore,
                      g_canvas.width - metrics.width - 1, 25);

   if ( g_showAccuracy )
   {
      g_accuracy = g_shotsRequired / g_shotsFired;
      var accuracy = Math.floor(g_accuracy * 100);
      if (!isNaN(g_accuracy))
      {
         var textw = g_enemiesDestroyed +
                      " ships destroyed. Shot accuracy " + accuracy + "%";
         var metrics = g_context.measureText(textw);
         g_context.fillText(textw, g_canvas.width/2-metrics.width/2,
                                   g_canvas.height/2);
      }
   }
}


Ship.prototype.up = function(engaged)
{
   if ( this.myVisible == false )
      return;

   if ( !engaged )
   {
      this.myVelY = 0;
      this.myUp = false;
      return;
   }
   else if ( this.myUp )
   {
      return;
   }

   if ( this.myDown )
      return;

   this.myVelY = -1 * this.myVelocity;
   this.myFrameCounter = 0;


   this.myUp = true;
}
Ship.prototype.down = function(engaged)
{
   if ( this.myVisible == false )
      return;

   if ( !engaged )
   {
      this.myVelY = 0;
      this.myDown = false;
      return;
   }
   else if ( this.myDown )
   {
      return;
   }

   if ( this.myUp )
      return;

   this.myVelY = this.myVelocity;
   this.myFrameCounter = 0;


   this.myDown = true;
}
Ship.prototype.left = function(engaged)
{
   if ( this.myVisible == false )
      return;

   if ( !engaged )
   {
      if ( !this.myRight)
      {
         this.myVelX = 0;
      }
      this.myLeft = false;
      return;
   }

   this.myVelX = -1 * this.myVelocity;
   this.myLeft = true;
}
Ship.prototype.right = function(engaged)
{
   if ( this.myVisible == false )
      return;

   if ( !engaged )
   {
      if ( !this.myLeft )
      {
         this.myVelX = 0;
      }
      this.myRight = false;
      return;
   }

   this.myVelX = this.myVelocity;
   this.myRight = true;
}

Ship.prototype.fire = function(engaged)
{
   if ( this.myVisible == false )
      return;

   if (this.myFiring)
   {
      if (!engaged)
         this.myFiring = false;
   }
   else
   {
      if (engaged)
      {
         this.myWeapon.fire();
         this.myWeapon.myFrameCounter = 0;
         this.myFiring = true;
      }
   }
}

Ship.prototype.renderPowers = function()
{
   if ( g_gameState == "game_over" )
      return;

   var xoff = 120;
   var yoff = 368;

   var mosBase = 3;
   var laser = false;
   if (this.myWeapon.myName == "laser")
   {
      mosBase = 1;
      laser = true;
   }

   for (var i = 3; i < this.myVelocity; ++i)
   {
      var img = document.getElementById("speed_image");
      g_context.drawImage(img, xoff, yoff);
      xoff += 40;
   }

   for (var i = mosBase; i < this.myWeapon.myMaxOnScreen; ++i)
   {
      var img = document.getElementById("shot_image");
      g_context.drawImage(img, xoff, yoff);
      xoff += 40;
   }

   if ( laser )
   {
      var img = document.getElementById("gun_image");
      g_context.drawImage(img, xoff, yoff);
      xoff += 40;
   }

   if ( this.myWeapon.myDoubled )
   {
      var img = document.getElementById("double_image");
      g_context.drawImage(img, xoff, yoff);
      xoff += 40;
   }
}
