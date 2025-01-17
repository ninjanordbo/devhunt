import type { NextApiRequest, NextApiResponse } from 'next';
import ProductsService from '@/utils/supabase/services/products';
import { createBrowserClient } from '@/utils/supabase/browser';
import { Product } from '@/utils/supabase/types';
import { ExtendedProduct } from '@/utils/supabase/CustomTypes';

export interface ChatGptDto {
  status: string
  message: string
  data: ChatGtpDtoData
}

export interface ChatGtpDtoData {
  date: string
  tools: ChatGtpDtoDataTool[]
  footer: string
}

export interface ChatGtpDtoDataTool {
  tool_id: number
  name: string
  description: string
  image_link: string
  date_added: string
  developer: string
  upvotes: number
  upvote_link: string
}

function prepareSuccessDto(input: string, tools: ExtendedProduct[]): ChatGtpDto {
  return {
    status: 'success',
    message: `Tools containing "${input}" in any way`,
    data: {
      tools: tools.map((t: ExtendedProduct) => ({
        tool_id: t.id,
        name: t.name,
        description: t.name,
        image_link: t.logo_url,
        data_added: new Date(t.created_at).toISOString().split('T')[0],
        developer: t.profiles.full_name,
        upvotes: t.votes_count,
        upvote_link: `https://devhunt.org/tool/${t.slug}`
      }))
    }
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { input } = req.query;

  const errorPayload = {
    status: 'error',
    data: null
  };

  if (!input) {
    res.json({ ...errorPayload, message: 'Empty input' });
    return;
  }

  const tools = await new ProductsService(createBrowserClient()).getToolsByNameOrDescription(input as string, 10);

  if (!tools) {
    res.json({ ...errorPayload, message: 'Nothing found' });
  }

  res.json(prepareSuccessDto(input as string, tools as ExtendedProduct[]));
}
