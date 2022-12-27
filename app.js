const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const initializerDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializerDbAndServer();

//API1
//It converts database object to response object
const convertDbObjectIntoResponseObject = (ObjItem) => {
  return {
    stateId: ObjItem.state_id,
    stateName: ObjItem.state_name,
    population: ObjItem.population,
  };
};

//Returns a list of all states in the state table
app.get("/states/", async (request, response) => {
  const getAllStatesQuery = `
        SELECT * FROM state ;
    `;
  const AllStatesArray = await db.all(getAllStatesQuery);
  response.send(
    AllStatesArray.map((each) => convertDbObjectIntoResponseObject(each))
  );
});

//API 2
//Returns a state based on the state ID
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetailsBasedOnIdQuery = `SELECT * FROM state WHERE state_id = ${stateId};
    `;

  const stateDetailsResponse = await db.get(getStateDetailsBasedOnIdQuery);
  response.send(convertDbObjectIntoResponseObject(stateDetailsResponse));
});

//API 3
//Returns District Successfully Added

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const AddDistrictDetailsQuery = `INSERT INTO district(district_name, state_id, cases, cured, active, deaths)
    VALUES('${districtName}',
            '${stateId}',
            '${cases}',
            '${cured}',
            '${active}',
            '${deaths}'
    )`;

  const ResponseOfQuery = await db.run(AddDistrictDetailsQuery);
  response.send("District Successfully Added");
});

//API 4
//It converts Database object into response object
const convertDbObjectToDistrictResponseObject = (ObjItem) => {
  return {
    districtId: ObjItem.district_id,
    districtName: ObjItem.district_name,
    stateId: ObjItem.state_id,
    cases: ObjItem.cases,
    cured: ObjItem.cured,
    active: ObjItem.active,
    deaths: ObjItem.deaths,
  };
};

//Returns a district based on the district ID

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictDetailsBasedOnIdQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  const DistrictDetailsResponse = await db.get(
    getDistrictDetailsBasedOnIdQuery
  );
  response.send(
    convertDbObjectToDistrictResponseObject(DistrictDetailsResponse)
  );
});

//API 5
//Deletes a district from the district table based on the district ID
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictDetailsQuery = `DELETE FROM district WHERE district_id = ${districtId};
    `;
  await db.run(deleteDistrictDetailsQuery);
  response.send("District Removed");
});

//API 6
//Updates the details of a specific district based on the district ID
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictDetailsQuery = `UPDATE district SET 
        district_name = '${districtName}',
        state_id = '${stateId}',
        cases = '${cases}',
        cured = '${cured}',
        active = '${active}',
        deaths = '${deaths}'
        WHERE district_id = ${districtId};`;
  await db.run(updateDistrictDetailsQuery);
  response.send("District Details Updated");
});

//API 7
//Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsOfStatesQuery = `SELECT SUM(cases) AS totalCases,
             SUM(cured) AS totalCured,
             SUM(active) AS totalActive,
             SUM(deaths) As totalDeaths
    FROM district  WHERE state_id = ${stateId};
    `;
  const statsResponse = await db.get(getStatsOfStatesQuery);
  response.send(statsResponse);
});

//API 8
//Returns an object containing the state name of a district based on the district ID
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `SELECT state_name AS stateName FROM district NATURAL JOIN state WHERE district_id = ${districtId};`;
  const responseOfStateNameQuery = await db.get(getStateNameQuery);
  response.send(responseOfStateNameQuery);
});

module.exports = app;
