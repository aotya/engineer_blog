import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import TopCard from './TopCard';
import topStyles from '../page/Top.module.scss';
import type { PostEdge } from '../../../lib/helpers/apiType';

type TopCardArgs = {
  title: string;
  categoryName: string;
  date: string;
  imageUrl: string;
};

const buildItem = ({ title, categoryName, date, imageUrl }: TopCardArgs): PostEdge => ({
  cursor: 'cursor-1',
  node: {
    id: '1',
    postId: '1',
    slug: 'sample-post',
    title,
    date,
    content: '',
    categories: {
      nodes: [{ name: categoryName, slug: 'react', uri: '/coding/react/' }],
    },
    featuredImage: {
      node: { sourceUrl: imageUrl },
    },
  },
});

const meta: Meta<TopCardArgs> = {
  title: 'Elements/TopCard',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <section className={topStyles.programmingContainer}>
        <div className={topStyles.programmingContainerInner}>
          <ul className={topStyles.articleListContainer}>
            <Story />
          </ul>
        </div>
      </section>
    ),
  ],
  argTypes: {
    title: { control: 'text', description: '記事タイトル' },
    categoryName: { control: 'text', description: 'カテゴリ名' },
    date: { control: 'date', description: '投稿日' },
    imageUrl: { control: 'text', description: 'サムネイル画像URL' },
  },
  render: (args) => <TopCard item={buildItem(args)} />,
};

export default meta;

type Story = StoryObj<TopCardArgs>;

export const Default: Story = {
  args: {
    title: 'Next.js 16 で Storybook を導入する。変更',
    categoryName: 'React',
    date: '2026-07-16',
    imageUrl: 'https://placehold.co/600x400?text=Blog',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Tailwind CSS v4 と SCSS Modules を併用しながら Storybook でコンポーネントカタログを整備する方法',
    categoryName: 'Frontend',
    date: '2026-07-01',
    imageUrl: 'https://placehold.co/600x400?text=Long+Title',
  },
};
