// @open license with citation
// @please feel free to reuse this code for any purpose, citing dougx.net
// @see http://dougx.net/plunder/license.txt for MIT open license text


function collision(AX1,AY1,AX2,AY2, BX1,BY1,BX2,BY2)
{
   if ( AX1 < BX1 )
   {
      if ( AX2 < BX1 )
         return false;
      else
      {
         if (AY1 < BY1)
         {
            if (AY2 < BY1)
               return false;
            else
               return true;
         }
         else
         {
            if ( AY1 > BY2 )
               return false;
            else
               return true;
         }
      }
   }
   else
   {
      if (AX1 > BX2)
         return false;
      else
      {
         if ( AY1 < BY1 )
         {
           if (AY2 < BY1)
              return false;
           else
              return true;
         }
         else
         {
            if (AY1 > BY2)
               return false;
           else
              return true;
         }
      }
   }
   return false; // should never get here
}
