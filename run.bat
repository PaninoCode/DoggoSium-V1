set /p choice=Sei sul computer di Alex? [y/n]
IF %choice% == y goto ComputerAlex
IF %choice% == n goto ComputerMattia

:ComputerAlex
cd F:\\doggosium
node main.js

:ComputerMattia
cd C:\Users\Mattia\Documents\GitHub\DoggoSium
node main.js