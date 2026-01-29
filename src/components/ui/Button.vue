<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-2">
      <Loader2 class="w-4 h-4 animate-spin" />
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ring-offset-background active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500',
        destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-400 hover:to-red-500',
        outline: 'border border-slate-600 bg-transparent hover:bg-slate-800 hover:border-slate-500 text-slate-300 hover:text-white',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-600',
        ghost: 'hover:bg-slate-800 hover:text-white text-slate-400',
        link: 'underline-offset-4 hover:underline text-blue-400 hover:text-blue-300',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 rounded-lg text-xs',
        lg: 'h-12 px-6 rounded-xl text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface Props {
  variant?: ButtonVariantProps['variant'];
  size?: ButtonVariantProps['size'];
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  type: 'button',
  disabled: false,
  loading: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  return cn(buttonVariants({ variant: props.variant, size: props.size }), props.class);
});
</script>
