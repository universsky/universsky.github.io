// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text


      function Sortie(launchTime)
      {
         this.myLaunchTime = launchTime;
         this.myComponents = new Array();
         this.myLaunched = false;
      }

      Sortie.prototype.add = function(id, x, y, velx, vely)
      {
         this.myComponents.push(new Enemy(id, x, y, velx, vely));
      }

      Sortie.prototype.launch = function()
      {
         if ( this.myLaunched )
            return;

         var i;

         for (i = 0; i < this.myComponents.length; ++i )
            g_enemies.push(this.myComponents[i]);

         this.myLaunched = true;

         return this.myComponents[i-1];
      }
