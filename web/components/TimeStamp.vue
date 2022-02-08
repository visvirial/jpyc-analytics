<template>
	<span>
		{{ new Date(1000 * value).toLocaleString() }}
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class TimeStamp extends Vue {
	@Prop({ type: Number, required: true, })
	value!: number;
}
</script>

