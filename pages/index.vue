<template>
  <div class="w-[100vw] h-[100vh] flex flex-col justify-center items-center">
    <div
      v-if="show_result"
      class="w-[800px]"
    >
      <Bar
        :chart-options="chart_options"
        :chart-data="chart_data"
      />
      <!-- row for column selection buttons -->
      <div class="mt-10 w-full flex justify-center">
        <button
          v-for="label, i of response_columns"
          :class="{
            'hover:bg-red-300 text-white font-bold py-2 px-4 rounded mx-2': true,
            'bg-red-900': selected_column_label !== label,
            'bg-red-400': selected_column_label === label,
          }"
          :key="i"
          @click="onColumnSelection(label)"
        >
          {{ label }}
        </button>
      </div>
      <!-- text describing conformity to mathematical laws -->
      <div class="mt-10 w-full flex flex-col justify-center items-center">
        <p>
          This column set
          <span v-if="selected_column_conforms_to_benfords_law" class="text-green-500 font-bold">DOES</span>
          <span v-else class="text-red-500 font-bold">DOES NOT</span>
          conform to Benford's Law.
        </p>
        <p>
          It
          <span v-if="selected_column_conforms_to_law_of_avgs" class="text-green-500 font-bold">DOES</span>
          <span v-else class="text-red-500 font-bold">DOES NOT</span>
          conform to the law of averages.
        </p>
      </div>
      <!-- back button -->
      <div class="mt-10 w-full flex justify-center">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          @click="show_result = false"
        >
          Back
        </button>
      </div>
    </div>
    <!-- file upload widget -->
    <div v-else class="w-full h-full flex flex-col justify-center items-center">
      <div>Upload a data set to find out if it conforms to Benford's Law...</div>
      <input
        type="file"
        name=""
        id=""
        class="mt-6"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default {
  components: {
    Bar,
  },
  data: () => ({
    show_result: false,
    selected_column_label: null,
    selected_column_conforms_to_benfords_law: null,
    selected_column_conforms_to_law_of_avgs: null,
    chart_data: {
      labels: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
      ],
      datasets: [
        {
          label: 'Leading Digit',
          backgroundColor: '#f87979',
          barThickness: 20,
        },
        {
          label: 'Expected',
          backgroundColor: '#777777',
          xAxisID: 'x2'
        }
      ]
    },
    chart_options: {
      scales: {
        x: {},
        x2: {
          display: false // Dont show the axes since it is just a duplicate
        }
      }
    },
  }),
  methods: {
    async handleFileChange(e) {
      const file = e?.target?.files[0];
      if (!file) {
        return;
      }

      // upload the file as multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      const headers = { 'Content-Type': 'multipart/form-data' };
      const res = await this.$axios.post('/api', formData, { headers });
      console.log(res)

      // store some values from the response
      this.response_data = res.data.result;
      const { columns } = this.response_data;
      this.response_columns = [];
      for (const { label, leading_digits } of Object.values(columns)) {
        if (!!leading_digits) {
          this.response_columns.push(label)
        }
      }

      // select the first column & render our bar chart
      this.onColumnSelection(this.response_columns[0])
      this.show_result = true;
    },
    onColumnSelection(selected_column_label) {
      this.selected_column_label = selected_column_label;

      const {
        leading_digits,
        total_numerical_entries,
        conforms_to_benfords_law,
        conforms_to_law_of_avgs,
      } = Object.values(this.response_data.columns)
        .find(({ label }) => label === selected_column_label)

      this.$set(this.chart_data.datasets[0], 'data', [
        leading_digits['1'],
        leading_digits['2'],
        leading_digits['3'],
        leading_digits['4'],
        leading_digits['5'],
        leading_digits['6'],
        leading_digits['7'],
        leading_digits['8'],
        leading_digits['9'],
      ]);

      // fill our "expectation" data set with the average of total_entries
      const expected_avg = Math.round(total_numerical_entries / 9);
      this.$set(this.chart_data.datasets[1], 'data', [
        expected_avg,
        expected_avg,
        expected_avg,
        expected_avg,
        expected_avg,
        expected_avg,
        expected_avg,
        expected_avg,
        expected_avg,
      ]);

      this.selected_column_conforms_to_benfords_law = conforms_to_benfords_law;
      this.selected_column_conforms_to_law_of_avgs = conforms_to_law_of_avgs;
    }
  },
}
</script>
