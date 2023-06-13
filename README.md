# lombardo-l7-test

**Challenge: Benford's Law**

In 1938, Frank Benford published a paper showing the distribution of the leading digit in many disparate sources of data. In all these sets of data, the number 1 was the leading digit about 30% of the time. Benford’s law has been found to apply to population numbers, death rates, lengths of rivers, mathematical distributions given by some power law, and physical constants like atomic weights and specific heats.
Create a web application (use of tornado or flask is fine) that:
1. can ingest the attached example file (census_2009b) and any other flat file with a viable target column. Note that other columns in user-submitted files may or may not be the same as the census data file and users are known for submitting files that don't always conform to rigid expectations. How you deal with files that don't conform to the expectations of the application is up to you, but should be reasonable and defensible.
2. validates Benford’s assertion based on the '7_2009' column in the supplied file
3. Outputs back to the user a graph of the observed distribution of numbers with an overlay of the expected distribution of numbers. The output should also inform the user of whether the observed data matches the expected data distribution.

The delivered package should contain a docker file that allows us to docker run the application and test the functionality directly.

Bonus points for automated tests.

Stretch challenge: persist the uploaded information to a database so a user can come to the application and browse through datasets uploaded by other users. No user authentication/user management is required here… assume anonymous users and public datasets.

## To Run Solution
```bash
# Clone this repo
git clone git@github.com:robertlombardo/lombardo-l7-challenge.git

# Run the application with docker-compose
cd lombardo-l7-challenge
docker-compose up --build
```
