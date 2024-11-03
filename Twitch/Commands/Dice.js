module.exports = {
     executeTwitch(message) {
         const tmpMessage = message.toLowerCase();
         args = tmpMessage.replaceAll("!dice", "").replaceAll(" ", "");

         let sides = 6;
         if(isUINT(args) && Number(args) > 0)
             sides = Number(args);

         const result = Math.floor(Math.random() * sides) + 1;

         return `Votre jet de dé (${sides} face(s)) à donné comme résultat : ${result.toString()}`;

         function isUINT(v){
             let r = RegExp(/(^[^\-]{0,1})?(^[\d]*)$/);
             return r.test(v) && v.length > 0;
         }
     }
}