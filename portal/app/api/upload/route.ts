import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import sharp from 'sharp';

export const runtime = 'nodejs';

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8056';
const MAX_WIDTH = 1920;
const QUALITY = 80;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 管理者認証情報で一時トークン取得
async function getAdminToken() {
  const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'dash2admin',
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data.access_token;
}

export async function POST(request: Request) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（最大10MB）' },
        { status: 400 }
      );
    }

    // 画像タイプチェック
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '画像ファイルのみアップロード可能です' },
        { status: 400 }
      );
    }

    // ファイルをBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // sharpで画像を圧縮・リサイズ
    const metadata = await sharp(buffer).metadata();
    let processedBuffer = buffer;

    // 幅が最大幅を超える場合はリサイズ
    if (metadata.width && metadata.width > MAX_WIDTH) {
      processedBuffer = await sharp(buffer)
        .resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality: QUALITY, progressive: true })
        .toBuffer();
    } else {
      // リサイズ不要でも品質圧縮を適用
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        processedBuffer = await sharp(buffer)
          .jpeg({ quality: QUALITY, progressive: true })
          .toBuffer();
      } else if (file.type === 'image/png') {
        processedBuffer = await sharp(buffer)
          .png({ compressionLevel: 9, progressive: true })
          .toBuffer();
      } else if (file.type === 'image/webp') {
        processedBuffer = await sharp(buffer)
          .webp({ quality: QUALITY })
          .toBuffer();
      }
    }

    // Directusにアップロード
    const token = await getAdminToken();
    const uploadFormData = new FormData();

    // 拡張子を取得
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    uploadFormData.append('file', new Blob([processedBuffer], { type: file.type }), filename);

    const uploadResponse = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Directus upload error:', errorText);
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();

    // 圧縮情報をレスポンスに含める
    return NextResponse.json({
      id: uploadData.data.id,
      filename: uploadData.data.filename_download,
      url: `${DIRECTUS_URL}/assets/${uploadData.data.id}`,
      originalSize: file.size,
      compressedSize: processedBuffer.length,
      compressionRatio: ((1 - processedBuffer.length / file.size) * 100).toFixed(1),
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: '画像のアップロードに失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
