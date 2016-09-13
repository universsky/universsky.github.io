// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



      function Laser()
      {
         this.myFrameCounter = 0;
         this.myHitPoints = 2;
         this.myVelX = 30;
         this.myVelY = 0;
         this.myRepeatRate = 12;
         this.myMaxOnScreen = 1;
         this.myDoubled = false;

         this.myName = "laser";
      }

      Laser.prototype.repeat = function()
      {
         if ( this.myFrameCounter > this.myRepeatRate )
         {
            this.myFrameCounter = 0;
            return true;
         }
        this.myFrameCounter++;
        return false;
      }

      Laser.prototype.fire = function()
      {
         var sos = 0;            // shots on screen

         var max = this.myMaxOnScreen;
         if (this.myDoubled)
            max *= 2;

         for (var i = 0; i < g_projectiles.length; ++i)
            if (g_projectiles[i].myName == "laser" )
               sos++;

         if ( sos >= max )
            return;

         g_laserShotSound.play();

         if (!this.myDoubled)
         {
            g_projectiles.push(new Shot(this));
            if ( !g_levelDirector.myBonusSequence )
               g_shotsFired += this.myHitPoints;
         }
         else
         {
            var x = g_ship.myX + 36;
            var y = g_ship.myY +  g_ship.myHeight - 47;
            g_projectiles.push(new Shot(this,x,y));

            var x = g_ship.myX + 36;
            var y = g_ship.myY + g_ship.myHeight - 23;
            g_projectiles.push(new Shot(this,x,y));

            if ( !g_levelDirector.myBonusSequence )
               g_shotsFired += this.myHitPoints * 2;
         }
      }
