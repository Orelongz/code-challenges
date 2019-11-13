import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";
const primaryColors = ["red", "blue", "yellow"];
const numberOfRecords = 500;

// Your retrieve function plus any additional functions go here ...
function retrieve(options = {}) {
  const { page = 1, colors = [] } = options;

  // fetching pages of 10 items at a time
  const limit = 10;
  const offset = (limit * page) - limit;
  let url = constructURL(window.path, limit, offset, colors);

  return new Promise(resolve => (
    fetchAPIRequest(url.toString(), page, limit, resolve)
  ));
}

function constructURL(path, limit, offset, colors) {
  let url = URI(path)
    .addSearch("limit", limit)
    .addSearch("offset", offset);

  colors.forEach(color => url.addSearch("color[]", color));

  return url;
}

function fetchAPIRequest(url, page, limit, resolve) {
  fetch(url)
    .then(response => response.json())
    .then(records => {
      let ids = [], open = [], closedPrimaryCount = 0;

      if (records.length) {
        ids = records.map(record => record.id);
        open = calculateOpenRecords(records);
        closedPrimaryCount = calculateClosedPrimaryCount(records);
      }

      const previousPage = (page - 1) ?  (page - 1) : null;
      const nextPage = records.length && (page * limit) < numberOfRecords ? (page + 1) : null;

      return resolve({
        ids, open, closedPrimaryCount,
        previousPage, nextPage,
      });
    })
    .catch(error => {
      console.log(error.message);
      return resolve();
    });
}

function calculateOpenRecords(records) {
  return records
    .filter(record => record.disposition === 'open')
    .map(record => {
      record.isPrimary = primaryColors.includes(record.color);
      return record;
    });
}

function calculateClosedPrimaryCount(records) {
  return records
    .filter(record => (
      record.disposition === 'closed' &&
      primaryColors.includes(record.color)
    )).length;
}

export default retrieve;
