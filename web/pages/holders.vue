<template>
	<v-row justify="center" align="center">
		<v-col cols="12">
			
			<h1>Holders Ranking</h1>
			
			<v-data-table
				:headers="holdersHeaders"
				:items="holders.holders"
				:loading="loading"
				>
				<template v-slot:item.chain="{ item }">
					<ChainName :value="item.chain" />
				</template>
				<template v-slot:item.address="{ item }">
					<Address :chain="item.chain" :value="item.address" />
				</template>
				<template v-slot:item.value="{ item }">
					<Amount :value="Number.parseFloat(item.value)" />
				</template>
			</v-data-table>
			
		</v-col>
	</v-row>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator';

@Component({
	name: 'HoldersPage',
})
export default class Holders extends Vue {
	loading = true;
	holdersHeaders = [
		{
			text: 'Rank',
			value: 'rank',
		},
		{
			text: 'Blockchain',
			value: 'chain',
		},
		{
			text: 'Address',
			value: 'address',
		},
		{
			text: 'Amount',
			value: 'value',
			align: 'right',
		},
	];
	holders = {
		count: 0,
		holders: [],
	};
	async mounted() {
		this.loading = true;
		this.holders = await this.$axios.$get(`holders?limit=${Number.MAX_SAFE_INTEGER}`);
		this.loading = false;
	}
}
</script>
