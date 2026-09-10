window.updateConnSmythePlayers =
async function() {

  const response = await fetch(
    "https://api-web.nhle.com/v1/skater-stats-leaders/current"
  );

  const data = await response.json();

  console.log(data);

};
