const Discord = require('discord.js'); //Per il dicord client
const client = new Discord.Client(); //Creazione del discord client
const http = require('http'); //Per lo scaricamento dei file
const fs = require('fs'); //Per il controllo del file system

/*

Da fare:

- Comando sium stop
	Smette di leggere e imposta la variabile lavorando su false.

- Risolvere il bug della disconnessione
	Quando il bot viene disconnesso si bugga e non fa più niente.
	Questo è probabilmente perché la variabile lavorando rimane bloccata su true.

- Aggiungere la lingua giapponese e cinese
	Penso questo sia facile da capire

*/

//CONTROLLA ALLA FINE DEL FILE PER VEDERE SE E' PRESENTE IL TOKEN DEL BOT PRIMA DI FARE DEI COMMIT

//All'avvio del bot
client.once('ready', () => {
    process.title = "Sium Bot V3";
    console.clear();
	console.log('Sium Bot V3');
	//Imposta la variabile che indica se il bot sta leggendo un messaggio su falso
	lavorando = false;
});

//Quando ricevi un messaggio da un utente
client.on('message', message => {
	//Controlla se il messaggio inizia con sium say
    if (message.content.toLowerCase().startsWith("sium say")) {
		console.log("provo ad entrare");
		//Controlla se il bot sta già lavorando
		if(lavorando == true){
			//...se il bot sta lavorando
			message.channel.send('Aspetta il tuo turno.');
		}else{ //...se il bot non sta lavorando
			if (message.member.voice.channel == null){ //Controlla se l'utente è in un canale vocale
				message.channel.send('Entra in un canale vocale prima');
			}else if(message.content.toLowerCase().length <= 500){ //Controlla se il messaggio non è più di 500 caratteri
				//..se non lo è richiama la funzione che legge i messaggi
				play(message);
			}else{
				//...se lo è avvisa l'utente
				message.channel.send('Falla più corta. (meno di 500 caratteri)');
			}
		}

		//Funzione che genera e legge i messaggi
        async function play(message) { //	"message" è un oggetto che rappresenta il messaggio ricevuto.
			
			//Cambia la variabile per indicare che il bot sta lavorando
			lavorando = true;

			//Genera un id (composto dal percorso della cartella + uuid unico + estensione .mp3)
			var id = "F:\\doggosium\\audio\\audio0_" + uuidv4() + ".mp3";
			
			//Funzione che genera gli uuid basandosi sullo standard iso
			function uuidv4() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
				});
			}

			var indicatore_lingua = message.content.toLowerCase(); //Crea la variabile per cercare gli indicatori della lingua
			var messaggio0 = message.content.toLowerCase().replace("sium say", "").replace("-it", "").replace("-en", ""); //Crea la variabile con il testo da leggere
			//Imposta la variabile per la lingua in base all'indicatore presente nel messaggio.
			if(indicatore_lingua.includes("-en")){
				//Per l'inglese
				var lang = "en-GB";
			}else{ //Se non sono presenti indicatori imposta l'italiano
				var lang = "it-IT";
			}
			//Controlla se il messaggio è vuoto
			if (messaggio0 != ""){
				//...se non è vuoto togli le parole proibite e gli spazi dal messaggio
				//							togli gli spazi					toglie le bestemmie										togli i termini razzisti
				var messaggio = messaggio0.replace(" ", "+").replace("dio", "io").replace("madonna", "mamma").replace("negro", "nero").replace("nigga", "nero").replace("nigger", "nero");
				//(So che è una soluzione orribile ma per ora funziona)
			}else if(messaggio0 == ""){
				//...se è vuoto informa l'utente
				var messaggio = "qualcuno+può+spiegare+a+" + message.author.username.replace(" ", "+") + "+che+deve+scrivere+qualcosa+dopo+sium+say";
			}

			//Scarica il file audio generato con l'api di google traduttore
			const file = fs.createWriteStream(id);
			//Imposta la lingua all'interno dell'url e il messaggio (basta una richiesta GET)
			const request = http.get("http://translate.google.com/translate_tts?ie=UTF-8&tl=" + lang + "&client=tw-ob&q=" + messaggio, function(response) {
				response.pipe(file); //Questa parte da problemi quando il file è troppo pesante. (non dovrebbe succedere con il limite di 500 caratteri ma a volte succede comunque)
			});
			
			//Calcola il tempo che servirà per scaricare il messaggio (estremamente semplificato rispetto a come dovrebbe essere fatto)
			var tempo = (message.content.toLowerCase().length * 10 + 3500); //E' molto probabile che sia anche questa parte a causare problemi con i file grandi.
			message.channel.send('Ok dammi un attimo. \n (circa ' + ((tempo % 60000) / 1000).toFixed(0) + " secondi)");
			//Richiama la funzione playFile dopo un certo periodo di tempo (in ms)
			setTimeout(() => playFile(id), tempo);

			//Leggi il file appena scaricato
			async function playFile(id){
				
				//Entra nel canale vocale
				const connection = await message.member.voice.channel.join();
				
				//Inizia leggendo i l file di apertura in base alla lingua
				const dispatcher = connection.play("F:\\doggosium\\bark_" + lang + ".wav");
				dispatcher.on('start', () => {
					console.log('ho abbaiato');
				});

				dispatcher.on('finish', () => {
					console.log('fine abbaiare');

					//Leggi il file con l'audio del tts
					const dispatcher = connection.play(id);

					dispatcher.on('start', () => {
						console.log(id + ' è in riproduzione');
					});
				
					dispatcher.on('finish', () => {
						console.log(id + ' - riproduzione terminata');
						connection.disconnect();						
						//elimina il file audio che viene creato e riprodotto per non occupare memoria
						fs.unlink(id,(err) => {
							if(err) throw err;
							console.log(id + ' was deleted');
						});
						//Una volta che la riproduzione di tutto è finita imposta la variabile su falso.
						lavorando = false;
					});
				});

				//Per gli errori nella connessione al canale vocale
				dispatcher.on('error', console.error);
			}
        }
    }
});



/*	CODICE PER GLI SLASH COMMANDS (che per ora non vengono usati)
client.ws.on('INTERACTION_CREATE', async interaction => {
    console.log(interaction.data.id);
    if (interaction.data.id.toString() === "id comando"){
        ComandoDoggo(interaction);
    }
})
*/

//	Ricorda di togliere SEMPRE il token del bot prima di fare i commit
client.login('');
