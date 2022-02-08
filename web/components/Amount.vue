<template>
	<span>
		{{ Math.floor(value).toLocaleString() }} <span style="font-size: 90%;">JPYC</span>
	</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';

@Component
export default class Amount extends Vue {
	@Prop({ type: Number, required: true, })
	value!: number;
}
</script>

