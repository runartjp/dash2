import { createDirectus, rest, readItems, readItem, createItem, updateItem, deleteItem, authentication } from '@directus/sdk';

// Directus コレクション型定義
export interface DirectusSchema {
  // 公開コンテンツ
  categories: Category[];
  public_articles: PublicArticle[];
  public_faq: PublicFAQ[];

  // 会員機能
  members_therapists: MembersTherapist[];
  members_courses: MembersCourse[];
  members_enrollments: MembersEnrollment[];

  // 患者管理
  patients_records: PatientRecord[];

  // 商品管理
  products_internal: ProductInternal[];
  products_competitor: ProductCompetitor[];
  products_reviews: ProductReview[];

  // コミュニティ機能
  community_posts: CommunityPost[];
  community_comments: CommunityComment[];
  community_likes: CommunityLike[];
  community_notifications: CommunityNotification[];
  community_groups: CommunityGroup[];
  community_group_members: CommunityGroupMember[];
  user_profiles: UserProfile[];
  user_privacy_settings: UserPrivacySettings[];
}

// カテゴリ
export interface Category {
  id: number;
  name: string;
  slug: string;
  type: 'article' | 'faq' | 'product' | 'course';
  icon?: string;
  color?: string;
  parent_category?: number;
  display_order?: number;
  date_created?: string;
  date_updated?: string;
}

// 公開記事
export interface PublicArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: number | Category;
  tags?: string[];
  author?: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  view_count?: number;
  status: 'published' | 'draft' | 'scheduled';
  date_created?: string;
  date_updated?: string;
  publish_date?: string;
}

// FAQ
export interface PublicFAQ {
  id: number;
  question: string;
  answer: string;
  category?: number | Category;
  display_order?: number;
  helpful_count?: number;
  date_created?: string;
  date_updated?: string;
}

// 治療家
export interface MembersTherapist {
  id: number;
  name: string;
  specialty?: string;
  experience_years?: number;
  bio?: string;
  certifications?: any[];
  clinic_name?: string;
  clinic_address?: any;
  clinic_website?: string;
  social_links?: any;
  profile_image?: string;
  rating_average?: number;
  total_students?: number;
  status: 'active' | 'pending' | 'suspended';
  verified?: boolean;
  date_created?: string;
  date_updated?: string;
}

// コース
export interface MembersCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  instructor?: number | MembersTherapist;
  category?: number | Category;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration?: number;
  lesson_count?: number;
  price: number;
  discount_price?: number;
  syllabus?: any;
  requirements?: string;
  learning_objectives?: any[];
  thumbnail?: string;
  featured?: boolean;
  enrollment_count?: number;
  rating_average?: number;
  status: 'published' | 'draft';
  date_created?: string;
  date_updated?: string;
}

// 受講状況
export interface MembersEnrollment {
  id: number;
  user?: string;
  course?: number | MembersCourse;
  progress_percentage?: number;
  enrollment_date?: string;
  completion_date?: string;
  last_accessed?: string;
  certificate_issued?: boolean;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'cancelled';
  date_created?: string;
  date_updated?: string;
}

// 患者カルテ
export interface PatientRecord {
  id: number;
  patient_name: string;
  patient_age?: number;
  patient_gender?: 'male' | 'female' | 'other';
  therapist?: number | MembersTherapist;
  visit_date?: string;
  visit_count?: number;
  chief_complaint?: string;
  symptoms?: any[];
  diagnosis?: string;
  treatment_details?: string;
  prescription?: string;
  progress_notes?: string;
  next_visit_date?: string;
  confidential?: boolean;
  status: 'active' | 'closed' | 'on_hold';
  date_created?: string;
  date_updated?: string;
}

// 自社商品
export interface ProductInternal {
  id: number;
  name: string;
  sku?: string;
  description: string;
  category?: number | Category;
  price: number;
  sale_price?: number;
  cost_price?: number;
  stock_quantity?: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'pre_order';
  features?: any[];
  specifications?: any;
  manufacturer?: string;
  supplier?: string;
  seo_title?: string;
  seo_description?: string;
  date_created?: string;
  date_updated?: string;
}

// 競合商品
export interface ProductCompetitor {
  id: number;
  name: string;
  manufacturer?: string;
  category?: number | Category;
  price?: number;
  description?: string;
  strengths?: string;
  weaknesses?: string;
  market_share?: number;
  target_market?: string;
  official_website?: string;
  purchase_url?: string;
  analysis_notes?: string;
  date_created?: string;
  date_updated?: string;
}

// 商品レビュー
export interface ProductReview {
  id: number;
  user?: string;
  product_internal?: number | ProductInternal;
  rating: number;
  comment?: string;
  pros?: string;
  cons?: string;
  verified_purchase?: boolean;
  helpful_count?: number;
  status: 'published' | 'pending' | 'rejected';
  date_created?: string;
  date_updated?: string;
}

// コミュニティ投稿
export interface CommunityPost {
  id: number;
  user?: string;
  group?: number | CommunityGroup;
  content: string;
  post_type: 'text' | 'question' | 'discussion' | 'announcement' | 'poll';
  mentioned_users?: any;
  hashtags?: any;
  like_count?: number;
  comment_count?: number;
  is_pinned?: boolean;
  is_edited?: boolean;
  edited_at?: string;
  status: 'published' | 'draft' | 'archived';
  date_created?: string;
  date_updated?: string;
}

// コミュニティコメント
export interface CommunityComment {
  id: number;
  post?: number | CommunityPost;
  user?: string;
  parent_comment?: number | CommunityComment;
  content: string;
  mentioned_users?: any;
  like_count?: number;
  is_edited?: boolean;
  edited_at?: string;
  status: 'published' | 'hidden' | 'deleted';
  date_created?: string;
  date_updated?: string;
}

// いいね
export interface CommunityLike {
  id: number;
  user?: string;
  post?: number | CommunityPost;
  comment?: number | CommunityComment;
  date_created?: string;
}

// 通知
export interface CommunityNotification {
  id: number;
  recipient?: string;
  sender?: string;
  type: 'mention' | 'like_post' | 'like_comment' | 'comment' | 'reply' | 'group_invite' | 'group_join' | 'system';
  related_post?: number | CommunityPost;
  related_comment?: number | CommunityComment;
  related_group?: number | CommunityGroup;
  message: string;
  is_read?: boolean;
  read_at?: string;
  date_created?: string;
}

// グループ
export interface CommunityGroup {
  id: number;
  name: string;
  slug: string;
  description?: string;
  cover_image?: string;
  icon?: string;
  color?: string;
  category?: number | Category;
  creator?: string;
  is_private?: boolean;
  allow_member_posts?: boolean;
  require_approval?: boolean;
  member_count?: number;
  post_count?: number;
  status: 'active' | 'archived';
  date_created?: string;
  date_updated?: string;
}

// グループメンバー
export interface CommunityGroupMember {
  id: number;
  group?: number | CommunityGroup;
  user?: string;
  role: 'admin' | 'moderator' | 'member';
  status: 'active' | 'pending' | 'banned';
  joined_at?: string;
  invited_by?: string;
  date_created?: string;
}

// ユーザープロフィール
export interface UserProfile {
  id: number;
  user?: string;
  display_name: string;
  bio?: string;
  avatar?: string;
  cover_image?: string;
  website?: string;
  location?: string;
  specialties?: any;
  interests?: any;
  social_links?: any;
  post_count?: number;
  comment_count?: number;
  verified?: boolean;
  is_profile_public?: boolean;
  date_created?: string;
  date_updated?: string;
}

// プライバシー設定
export interface UserPrivacySettings {
  id: number;
  user?: string;
  email_visible?: boolean;
  location_visible?: boolean;
  show_online_status?: boolean;
  allow_messages?: boolean;
  allow_mentions?: boolean;
  allow_group_invites?: boolean;
  notification_email?: boolean;
  notification_push?: boolean;
  date_created?: string;
  date_updated?: string;
}

// Directus クライアント作成
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';

export const directus = createDirectus<DirectusSchema>(directusUrl)
  .with(rest())
  .with(authentication());

// API ヘルパー関数

// カテゴリ
export async function getCategories(type?: string) {
  const filter = type ? { type: { _eq: type } } : {};
  return await directus.request(
    readItems('categories', {
      filter: filter as any,
      sort: ['display_order', 'name'],
    })
  );
}

// 公開記事
export async function getArticles(status: string = 'published') {
  return await directus.request(
    readItems('public_articles', {
      filter: { status: { _eq: status } } as any,
      fields: ['*', { category: ['id', 'name', 'slug'] }] as any,
      sort: ['-date_created'],
    })
  );
}

export async function getArticleBySlug(slug: string) {
  const articles = await directus.request(
    readItems('public_articles', {
      filter: { slug: { _eq: slug } } as any,
      fields: ['*', { category: ['id', 'name', 'slug'] }] as any,
      limit: 1,
    })
  );
  return articles[0] || null;
}

// FAQ
export async function getFAQs(categoryId?: number) {
  const filter = categoryId ? { category: { _eq: categoryId } } : {};
  return await directus.request(
    readItems('public_faq', {
      filter,
      fields: ['*', { category: ['id', 'name'] }],
      sort: ['display_order'],
    })
  );
}

// 治療家
export async function getTherapists(status: string = 'active') {
  return await directus.request(
    readItems('members_therapists', {
      filter: { status: { _eq: status } } as any,
      sort: ['-rating_average', 'name'],
    })
  );
}

export async function getTherapistById(id: number) {
  return await directus.request(
    readItem('members_therapists', id)
  );
}

// コース
export async function getCourses(status: string = 'published') {
  return await directus.request(
    readItems('members_courses', {
      filter: { status: { _eq: status } } as any,
      fields: ['*', { instructor: ['id', 'name', 'specialty'], category: ['id', 'name'] }] as any,
      sort: ['-featured', '-date_created'],
    })
  );
}

export async function getCourseBySlug(slug: string) {
  const courses = await directus.request(
    readItems('members_courses', {
      filter: { slug: { _eq: slug } },
      fields: ['*', { instructor: ['*'], category: ['*'] }],
      limit: 1,
    })
  );
  return courses[0] || null;
}

// コミュニティ投稿
export async function getCommunityPosts(groupId?: number) {
  const filter = groupId
    ? { group: { _eq: groupId }, status: { _eq: 'published' } }
    : { group: { _null: true }, status: { _eq: 'published' } };

  return await directus.request(
    readItems('community_posts', {
      filter: filter as any,
      fields: ['*', { group: ['id', 'name'] }] as any,
      sort: ['-is_pinned', '-date_created'],
      limit: 50,
    })
  );
}

// グループ
export async function getGroups(status: string = 'active') {
  return await directus.request(
    readItems('community_groups', {
      filter: { status: { _eq: status } } as any,
      fields: ['*', { category: ['id', 'name'] }] as any,
      sort: ['-member_count'],
    })
  );
}

export async function getGroupBySlug(slug: string) {
  const groups = await directus.request(
    readItems('community_groups', {
      filter: { slug: { _eq: slug } },
      fields: ['*', { category: ['*'] }],
      limit: 1,
    })
  );
  return groups[0] || null;
}

// 商品
export async function getProducts() {
  return await directus.request(
    readItems('products_internal', {
      fields: ['*', { category: ['id', 'name'] }],
      sort: ['name'],
    })
  );
}

export async function getCompetitorProducts() {
  return await directus.request(
    readItems('products_competitor', {
      fields: ['*', { category: ['id', 'name'] }],
      sort: ['manufacturer', 'name'],
    })
  );
}

export default directus;
