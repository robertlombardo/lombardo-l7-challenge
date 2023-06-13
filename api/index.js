const express = require('express');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const readline = require('readline');

// configure multer to store uploaded files to a temp folder on disk
const upload = multer({ dest: os.tmpdir() });

// Create app instance
const app = express()

// Define JSON as return type
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const result = {
      columns: {},
      line_read_errs: [],
    };

    const rl = readline.createInterface({
      input: fs.createReadStream(req.file.path, 'utf8'),
      crlfDelay: Infinity
    });

    let line_num = 0;
    rl.on('line', line => {
      try {
        let vals = line.split('\t').map(val => val.trim());

        for (let i = 0; i < vals.length; ++i) {
          const val = vals[i];
          if (line_num === 0) {
            // initialize column sets with the column label from the 0th line
            result.columns[i] = { label: val }
          } else {
            // work only on numerical, non-zero values
            const parsed_num = parseInt(val, 10);
            const is_num = !isNaN(parsed_num);
            if (is_num && parsed_num > 0) {
              const leading_digit = parsed_num.toString()[0];
              const this_column_set = result.columns[i];

              if (!this_column_set.leading_digits) {
                // initialize the column set's counters
                this_column_set.total_numerical_entries = 0;
                this_column_set.leading_digits = {
                  '1': 0,
                  '2': 0,
                  '3': 0,
                  '4': 0,
                  '5': 0,
                  '6': 0,
                  '7': 0,
                  '8': 0,
                  '9': 0,
                }
              } 

              // increment counters
              ++this_column_set.total_numerical_entries;
              ++this_column_set.leading_digits[leading_digit]
            }
          }
        }
      } catch (err) {
        result.line_read_errs.push({ line_num, err })
      } finally {
        ++line_num;
      }
    });

    rl.on('close', () => {
      try {
        for (const column_set of Object.values(result.columns)) {
          const { leading_digits } = column_set;
          if (leading_digits) {
            // validate conformity to benfords law
            column_set.conforms_to_benfords_law = leading_digits['1'] > leading_digits['2']
              && leading_digits['2'] > leading_digits['3']
              && leading_digits['3'] > leading_digits['4']
              && leading_digits['4'] > leading_digits['5']
              && leading_digits['5'] > leading_digits['6']
              && leading_digits['6'] > leading_digits['7']
              && leading_digits['7'] > leading_digits['8']
              && leading_digits['8'] > leading_digits['9'];

            // validate conformity to law of averages
            const expected_avg = column_set.total_numerical_entries / 9;
            const standard_deviation = expected_avg * 0.1;
            column_set.conforms_to_law_of_avgs = Math.abs(expected_avg - leading_digits['1']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['2']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['3']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['4']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['5']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['6']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['7']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['8']) <= standard_deviation
              && Math.abs(expected_avg - leading_digits['9']) <= standard_deviation
          }
        }
        res.json({ result });
      } catch (err) {
        console.error(err);
        res.status(500).send(err);
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

module.exports = {
  path: '/api',
  handler: app,
};
