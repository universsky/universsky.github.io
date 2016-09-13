//
// all enemies in the game are instantiated in this type 
//
// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text



function Enemy(id, x, y, velx, vely)
{
   this.myX = x;
   this.myY = y;
   this.myVelX = velx;
   this.myVelY = vely;

   this.myImage = document.getElementById(id);
   this.myHeight = this.myImage.height;
   this.myWidth = this.myImage.width;

   this.myPointValue = 0;
   this.myHitPoints = 0;

   this.mySpecial = false;
   this.mySpecialName = null;

   this.myXLeveler = -128;
   this.myYLeveler = -128;

   this.myBoss = false;

   if ( id.indexOf("special") != -1 )
   {
      this.mySpecial = true;
   }

   if ((id == "enemy_small") || (id == "enemy_small_special"))
   {
      this.myHitPoints = 1;
   }
   else if ( id.indexOf("small_2") != -1 )
   {
      this.myHitPoints = 2;
   }
   else if ( id.indexOf("small_3") != -1 )
   {
      this.myHitPoints = 4;
   }
   else if ( id.indexOf("small_4") != -1 )
   {
      this.myHitPoints = 4;
      this.myYLeveler = g_canvas.width * 0.5;
   }
   else if ( id.indexOf("artifact") != -1 )
   {
      this.mySpecial = true;
      this.myHitPoints = 4;
      this.mySpecialName = "artifact_chard";

      if ( id == "enemy_artifact_2" )
      {
         this.myHitPoints = 4;
         this.mySpecialName = "artifact_skull";
      }
   }
   else if ( id == "command_ship" )
   {
      this.myBoss = true;
      this.myHitPoints = 250;
      this.myXLeveler = g_canvas.width * 0.85;
   }

   this.myPointValue = this.myHitPoints * 100;
}


Enemy.prototype.render = function()
{
   var pullWidth  = g_canvas.width  - this.myX;
   var pullHeight = g_canvas.height - this.myY;

   if ( pullWidth > this.myWidth )
   {
      pullWidth = this.myWidth;
   }
   if ( pullHeight > this.myHeight )
   {
      pullHeight = this.myHeight;
   }

   if ( pullWidth > 0 && pullHeight > 0 )
   {
      g_context.drawImage(this.myImage,
                          0,0, pullWidth, pullHeight,
                          this.myX, this.myY, pullWidth, pullHeight );
   }

   this.myX += this.myVelX;
   this.myY += this.myVelY;

   if ( this.myX <= this.myYLeveler )
      this.myVelY = 0;

   if ( this.myX <= this.myXLeveler )
      this.myVelX = 0;

   if ( this.myBoss )
   {
      if (this.myY < g_ship.myY )
         this.myVelY = 1;
      else if (this.myY > g_ship.myY )
         this.myVelY = -1;

      // enemy health bar
      g_context.lineWidth = 1;
      g_context.strokeStyle = "red";
      g_context.fillStyle = "red";
      g_context.strokeRect(175, 10, 250, 20);
      g_context.fillRect(175, 10, 250 * this.myHitPoints/250, 20);
   }

   this.myFrameCounter++;

   var retVal = this.collisionOrOffscreen();
   return !retVal;
}


Enemy.prototype.collisionOrOffscreen = function()
{
   if ( this.myX > g_canvas.width )
      return false;

   if ( collision(
            this.myX,                this.myY,
            this.myX + this.myWidth, this.myY + this.myHeight,
            g_ship.myX +5,                  g_ship.myY +5,
            g_ship.myX + g_ship.myWidth -5, g_ship.myY + g_ship.myHeight -5 ))
   {
      if ( !g_ship.myDying )
      {
         var ae = new AfterEffect("splode", this.myX, this.myY,
                                  this.myVelX, this.myVelY);
         g_afterEffects.push(ae);
         g_ship.die();

         if ( this.myBoss == false )
            return true;
      }
   }

   var playSmallExplosion = false;
   var enemyDead = false;
   var remainingProjectiles = new Array();

   for (var i = 0; i < g_projectiles.length; ++i)
   {
      if ( !enemyDead )
      {
         if (collision(this.myX, this.myY,
                     this.myX + this.myWidth, this.myY + this.myHeight,
                     g_projectiles[i].myX, g_projectiles[i].myY,
                     g_projectiles[i].myX + g_projectiles[i].myWidth,
                     g_projectiles[i].myY + g_projectiles[i].myHeight ))
         {
            // if the shot landed, it was a required shot
            g_shotsRequired += g_projectiles[i].myHitPoints;

            if ( this.myBoss )
            {
               playSmallExplosion = true;
               var ae = new AfterEffect("splode",  g_projectiles[i].myX,
                                        g_projectiles[i].myY - 16,
                                        6, this.myVelY);
               g_afterEffects.push(ae);
            }

            this.myHitPoints -= g_projectiles[i].myHitPoints;
            if ( this.myHitPoints <= 0 )
            {
               g_enemiesDestroyed++;

               if (this.myBoss)
               {
                  g_explodeSound.play();
                  g_gameState = "boss_defeated";
                  delete g_enemyProjectiles;
                  g_enemyProjectiles = new Array();
               }
               playSmallExplosion = true;
               g_ship.myScore += this.myPointValue;
               var ae = new AfterEffect("splode", this.myX, this.myY,
                                        this.myVelX, this.myVelY);
               g_afterEffects.push(ae);

               if (this.mySpecial)
               {
                  if ( this.mySpecialName != null )
                     g_levelDirector.dropSpecial(this.myX, this.myY,
                                                 this.mySpecialName);
                  else
                     g_levelDirector.dropSpecial(this.myX, this.myY);
               }

               enemyDead = true;
            }
            delete g_projectiles[i];
         }
         else
         {
            // any projectile that hits is removed, it does not have
            // penetrating power based on hit points of the enemy
            remainingProjectiles.push(g_projectiles[i]);
         }
      }
      else
      {
         remainingProjectiles.push(g_projectiles[i]);
      }
   }

   if ( playSmallExplosion )
      g_smallExplodeSound.play();

   delete g_projectiles;
   g_projectiles = remainingProjectiles;

   if (enemyDead)
      return true;

   if ( this.myX + this.myWidth < 0 )
   {
      return true;
   }

   return false;
}
