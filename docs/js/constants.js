//Constantes nécessaires au foctionnement du Pool

const currentSubmission = 3; // à modifier pour 1, 2, 3, 4 selon le moment

//Résultats jusqu'à présent
const previousData = {
  // Ronde 1
  R1_EST_1_team: "TOR",
  R1_EST_2_team: "FLA",
  R1_EST_3_team: "WSH",
  R1_EST_4_team: "CAR",
  R1_WEST_1_team: "WPG",
  R1_WEST_2_team: "DAL",
  R1_WEST_3_team: "VGK",
  R1_WEST_4_team: "EDM",
  
  // Ronde 2
  R2_EST_1_team: "FLA",  
  R2_EST_2_team: "CAR",  
  R2_WEST_1_team: "DAL", 
  R2_WEST_2_team: "EDM", 

  // Ronde 3
  R3_EST_1_team: "",  // TOR gagne en Ronde 2
  R3_WEST_1_team: "", // WPG gagne en Ronde 2

  // Ronde 4 (Finale de la Coupe Stanley)
  R4_final_team: "",     // À choisir entre TOR (EST) et WPG (OUEST)
  R4_final_games: "",    // Choisir le nombre de matchs (4, 5, 6, 7)
};

// Liste des joueurs par équipe
const playersByTeam = {
        "CAR": ["Pyotr Kochetkov","Frederik Andersen","Sebastian Aho", "Seth Jarvis", , "Andrei Svechnikov", "Shayne Gostisbehere", "Jack Roslovic", "Jordan Staal", "Jordan Martinook", "Jackson Blake", "Jesperi Kotkaniemi", "Eric Robinson", "Brent Burns", "Dmitry Orlov", "Jaccob Slavin", "Taylor Hall", "Jalen Chatfield", "Sean Walker", "William Carrier", "Logan Stankoven", "Tyson Jost", "Jack Drury", "Mark Jankowski", "Mikko Rantanen", "Scott Morrow", "Juha Jaaska", "Justin Robidas", "Ty Smith", "Skyler Brind'Amour", "Bradly Nadeau", "Domenick Fensore", "Ryan Suzuki", "Riley Stillman"
],
        "COL": ["Mackenzie Blackwood","Scott Wedgewood","Nathan MacKinnon", "Cale Makar", "Artturi Lehkonen", "Devon Toews", "Jonathan Drouin", "Valeri Nichushkin", "Casey Mittelstadt", "Ross Colton", "Martin Necas", "Samuel Girard", "Joel Kiviranta", "Logan O'Connor", "Parker Kelly", "Josh Manson", "Sam Malinski", "Charlie Coyle", "Brock Nelson", "Jack Drury", "Nikolai Kovalenko", "Miles Wood", "Ivan Ivan", "Calvin de Haan", "Juuso Parssinen", "Oliver Kylington", "Ryan Lindgren", "John Ludvig", "Jimmy Vesey", "Erik Johnson", "Keaton Middleton", "Wyatt Aamodt", "Calum Ritchie", "T.J. Tynan", "Chris Wagner", "Jack Ahcan", "Chase Bradley", "Oskar Olausson", "Jason Polin", "Tye Felhaber", "Givani Smith", "Matt Stienburg", "Nikita Prishchepov", "Jere Innala"
],
        "DAL": ["Jake Oettinger","Casey DeSmith","Matt Duchene", "Jason Robertson", "Wyatt Johnston", "Roope Hintz", "Thomas Harley", "Jamie Benn", "Mason Marchment", "Evgenii Dadonov", "Esa Lindell", "Miro Heiskanen", "Mavrik Bourque", "Sam Steel", "Tyler Seguin", "Mikael Granlund", "Mikko Rantanen", "Colin Blackwell", "Oskar Bäck", "Ilya Lyubushkin", "Mathew Dumba", "Cody Ceci", "Lian Bichsel", "Brendan Smith", "Nils Lundkvist", "Justin Hryckowian", "Arttu Hyry", "Matěj  Blümel", "Kyle Capobianco", "Alexander Petrovic"
],
        "EDM": ["Stuart Skinner","Calvin Pickard","Leon Draisaitl", "Connor McDavid", "Evan Bouchard", "Ryan Nugent-Hopkins", "Zach Hyman", "Mattias Ekholm", "Darnell Nurse", "Corey Perry", "Connor Brown", "Jeff Skinner", "Viktor Arvidsson", "Adam Henrique", "Brett Kulak", "Vasily Podkolzin", "Mattias Janmark", "Kasperi Kapanen", "Ty Emberson", "Jake Walman", "Troy Stecher", "Derek Ryan", "John Klingberg", "Noah Philp", "Max Jones", "Matt Savoie", "Drake Caggiula", "Joshua Brown", "Trent Frederic", "Quinn Hutson", "Cam Dineen", "Travis Dermott"
],
        "FLA": ["Sergei Bobrovsky","Vitek Vanecek","Sam Reinhart", "Aleksander Barkov", "Matthew Tkachuk", "Carter Verhaeghe", "Sam Bennett", "Anton Lundell", "Aaron Ekblad", "Evan Rodrigues", "Mackie Samoskevich", "Gustav Forsling", "Eetu Luostarinen", "Jesper Boqvist", "Niko Mikkola", "Nate Schmidt", "Uvis Balinskis", "A.J. Greer", "Dmitry Kulikov", "Seth Jones", "Tomas Nosek", "Adam Boqvist", "Brad Marchand", "Jonah Gadjovich", "Justin Sourdif", "Matt Kiersted", "Jesse Puljujarvi", "Nico Sturm", "Rasmus Asplund", "Jaycob Megna", "Patrick Giles", "Tobias Bjornfot"
],
        "LAK": ["Darcy Kuemper","David Rittich","Adrian Kempe", "Anze Kopitar", "Kevin Fiala", "Quinton Byfield", "Warren Foegele", "Phillip Danault", "Alex Laferriere", "Trevor Moore", "Brandt Clarke", "Vladislav Gavrikov", "Jordan Spence", "Alex Turcotte", "Mikey Anderson", "Joel Edmundson", "Andrei Kuzmenko", "Drew Doughty", "Tanner Jeannot", "Trevor Lewis", "Jacob Moverare", "Samuel Helenius", "Andre Lee", "Akil Thomas", "Kyle Burroughs", "Taylor Ward", "Andreas Englund", "Jeff Malott", "Caleb Jones"
],
        "MIN": ["Filip Gustavsson","Marc-Andre Fleury","Marco Rossi", "Kirill Kaprizov", "Mats Zuccarello", "Frederick Gaudreau", "Marcus Johansson", "Jared Spurgeon", "Joel Eriksson Ek", "Marcus Foligno", "Brock Faber", "Ryan Hartman", "Jake Middleton", "Jonas Brodin", "Zach Bogosian", "Yakov Trenin", "Declan Chisholm", "Vincent Hinostroza", "Gustav Nyquist", "Marat Khusnutdinov", "Jakub Lauko", "Jon Merrill", "Liam Ohgren", "Devin Shore", "David Jiricek", "Justin Brazeau", "Brendan Gaunce", "Cameron Crotty", "Daemon Hunt", "Michael Milne", "Travis Boyd", "Reese Johnson", "Travis Dermott", "Ben Jones"
],
        "MTL": ["Sam Montembeault","Jakub Dobes","Nick Suzuki", "Cole Caufield", "Lane Hutson", "Juraj Slafkovský", "Brendan Gallagher", "Jake Evans", "Patrik Laine", "Christian Dvorak", "Mike Matheson", "Joel Armia", "Josh Anderson", "Alex Newhook", "Kirby Dach", "Alexandre Carrier", "Kaiden Guhle", "Emil Heineman", "David Savard", "Jayden Struble", "Arber Xhekaj", "Logan Mailloux", "Ivan Demidov", "Joshua Roy", "Oliver Kapanen", "Lucas Condotta", "Owen Beck", "Justin Barron", "Rafael Harvey-Pinard", "Alex Barré-Boulet", "Michael Pezzetta"
],
        "NJD": ["Jacob Markstrom","Jake Allen","Jesper Bratt", "Jack Hughes", "Nico Hischier", "Timo Meier", "Luke Hughes", "Stefan Noesen", "Dougie Hamilton", "Dawson Mercer", "Ondrej Palat", "Paul Cotter", "Erik Haula", "Brett Pesce", "Tomas Tatar", "Johnathan Kovacevic", "Brenden Dillon", "Nathan Bastian", "Jonas Siegenthaler", "Seamus Casey", "Cody Glass", "Justin Dowling", "Brian Dumoulin", "Curtis Lazar", "Simon Nemec", "Daniel Sprong", "Mike Hardman", "Marc McLaughlin", "Nolan Foote", "Daniil Misyul", "Brian Halonen", "Nathan Légaré", "Shane Bowers", "Dennis Cholowski", "Kurtis MacDermid"
],
        "OTT": ["Linus Ullmark","Anton Forsberg","Tim Stützle", "Drake Batherson", "Jake Sanderson", "Brady Tkachuk", "Claude Giroux", "Thomas Chabot", "Shane Pinto", "Ridly Greig", "Joshua Norris", "Michael Amadio", "Adam Gaudette", "Nick Jensen", "Dylan Cozens", "David Perron", "Nick Cousins", "Artem Zub", "Tyler Kleven", "Travis Hamonic", "Noah Gregor", "Matthew Highmore", "Fabian Zetterlund", "Jacob Bernard-Docker", "Nikolas Matinpalo", "Zack Ostapchuk", "Zack MacEwen", "Cole Reinhardt", "Dennis Gilbert", "Angus Crookshank", "Hayden Hodgson", "Jan Jenik", "Donovan Sebrango"
],
        "STL": ["Jordan Binnington","Joel Hofer","Robert Thomas", "Jordan Kyrou", "Dylan Holloway", "Pavel Buchnevich", "Brayden Schenn", "Jake Neighbours", "Cam Fowler", "Colton Parayko", "Zack Bolduc", "Justin Faulk", "Philip Broberg", "Oskar Sundqvist", "Alexey Toropchenko", "Brandon Saad", "Nathan Walker", "Radek Faksa", "Ryan Suter", "Mathieu Joseph", "Alexandre Texier", "Tyler Tucker", "Scott Perunovich", "Nick Leddy", "Jimmy Snuggerud", "Matthew Kessel", "P.O Joseph", "Kasperi Kapanen", "Dalibor Dvorsky", "Corey Schueneman"
],
        "TBL": ["Andrei Vasilevskiy","Jonas Johansson","Nikita Kucherov", "Brandon Hagel", "Brayden Point", "Jake Guentzel", "Victor Hedman", "Anthony Cirelli", "Nick Paul", "Darren Raddysh", "Ryan McDonagh", "Erik Cernak", "Gage Goncalves", "Nick Perbix", "Emil Lilleberg", "Mitchell Chaffee", "Yanni Gourde", "Conor Geekie", "J.J. Moser", "Mikey Eyssimont", "Oliver Bjorkstrand", "Cam Atkinson", "Luke Glendening", "Zemgus Girgensons", "Dylan Duke", "Declan Carlile", "Steven Santini", "Jack Finley", "Conor Sheary", "Maxwell Crozier"
],
        "TOR": ["Anthony Stolarz","Joseph Woll","Mitch Marner", "William Nylander", "Auston Matthews", "John Tavares", "Matthew Knies", "Morgan Rielly", "Bobby McMann", "Max Domi", "Oliver Ekman-Larsson", "Jake McCabe", "Nicholas Robertson", "Pontus Holmberg", "Steven Lorentz", "Chris Tanev", "Max Pacioretty", "David Kampf", "Simon Benoit", "Conor Timmins", "Calle Jarnkrok", "Philippe Myers", "Fraser Minten", "Scott Laughton", "Brandon Carlo", "Connor Dewar", "Alex Steeves", "Ryan Reaves", "Dakota Mermis", "Timothy Liljegren", "Jacob Quillan", "Jani Hakanpää", "Alexander Nylander", "Nikita Grebenkin"
],
        "VGK": ["Ilya Samsonov","Adin Hill","Jack Eichel", "Mark Stone", "Tomas Hertl", "Shea Theodore", "Pavel Dorofeyev", "Ivan Barbashev", "Brett Howden", "Noah Hanifin", "Alex Pietrangelo", "Nicolas Roy", "Keegan Kolesar", "William Karlsson", "Victor Olofsson", "Tanner Pearson", "Brayden McNabb", "Brandon Saad", "Zach Whitecloud", "Alexander Holtz", "Nicolas Hague", "Reilly Smith", "Kaedan Korczak", "Cole Schwindt", "Ben Hutton", "Callahan Burke", "Tanner Laczynski", "Grigori Denisenko", "Mason Morelli", "Robert Hagg", "Raphael Lavoie", "Brendan Brisson", "Jonas Rondbjerg"
],
        "WSH": ["Charlie Lindgren","Logan Thompson","Dylan Strome", "Alex Ovechkin", "Aliaksei Protas", "Pierre-Luc Dubois", "Tom Wilson", "Connor McMichael", "John Carlson", "Jakob Chychrun", "Rasmus Sandin", "Andrew Mangiapane", "Taylor Raddysh", "Nic Dowd", "Martin Fehérváry", "Matt Roy", "Trevor van Riemsdyk", "Brandon Duhaime", "Lars Eller", "Jakub Vrana", "Hendrix Lapierre", "Ethen Frank", "Anthony Beauvillier", "Ivan Miroshnichenko", "Michael Sgarbossa", "Dylan McIlrath", "Ryan Leonard", "Sonny Milano", "Alex Alexeyev"
],
        "WPG": ["Connor Hellebuyck","Eric Comrie","Kyle Connor", "Mark Scheifele", "Nikolaj Ehlers", "Josh Morrissey", "Gabriel Vilardi", "Cole Perfetti", "Neal Pionk", "Vladislav Namestnikov", "Nino Niederreiter", "Adam Lowry", "Alex Iafallo", "Mason Appleton", "Dylan Samberg", "Dylan DeMelo", "Colin Miller", "Morgan Barron", "Logan Stanley", "Rasmus Kupari", "Haydn Fleury", "David Gustafsson", "Brandon Tanev", "Nikita Chibrikov", "Luke Schenn", "Parker Ford", "Brad Lambert", "Jaret Anderson-Dolan", "Ville Heinola", "Dominic Toninato", "Dylan Coghlan"
],
    };

const round1Ids = [
      'R1_EST_1_team', 'R1_EST_2_team', 'R1_EST_3_team', 'R1_EST_4_team',
      'R1_WEST_1_team', 'R1_WEST_2_team', 'R1_WEST_3_team', 'R1_WEST_4_team'
    ];
