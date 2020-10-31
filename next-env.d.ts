/// <reference types="next" />
/// <reference types="next/types/global" />

export type ResponsiveImage = {
  __typename?: 'ResponsiveImage'
  alt?: Maybe<Scalars['String']>
  aspectRatio: Scalars['FloatType']
  base64?: Maybe<Scalars['String']>
  bgColor?: Maybe<Scalars['String']>
  height: Scalars['IntType']
  sizes: Scalars['String']
  src: Scalars['String']
  srcSet: Scalars['String']
  title?: Maybe<Scalars['String']>
  webpSrcSet: Scalars['String']
  width: Scalars['IntType']
}
