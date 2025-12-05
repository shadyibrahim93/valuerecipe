// components/Comments/Comments.js
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CommentItem from './CommentItem';
import RatingWidget from '../RatingWidget';

export default function Comments({
  recipeId,
  user,
  initialRating,
  initialRatingCount
}) {
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------
     LOAD ALL COMMENTS FOR THIS RECIPE
  ---------------------------------------- */
  async function loadComments() {
    const { data, error } = await supabase
      .from('recipe_comments')
      .select(
        `
        id,
        recipe_id,
        user_id,
        parent_id,
        comment_text,
        reaction_counts,
        user_reactions,
        created_at,
        profiles ( first_name, created_at )
      `
      )
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } else {
      setComments(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (recipeId) {
      loadComments();
    }
  }, [recipeId]);

  /* ----------------------------------------
     SUBMIT TOP-LEVEL COMMENT
  ---------------------------------------- */
  async function submitComment(e) {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    if (!user) {
      alert('Please sign in to leave a comment.');
      return;
    }

    const { error } = await supabase.from('recipe_comments').insert({
      recipe_id: recipeId,
      user_id: user.id,
      comment_text: newCommentText,
      parent_id: null
    });

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    setNewCommentText('');
    loadComments();
  }

  /* ----------------------------------------
     SPLIT TOP-LEVEL & REPLIES
  ---------------------------------------- */
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  return (
    <div className='vr-card'>
      <div className='vr-section'>
        <h3 className='vr-category__title'>Comments</h3>

        {/* RECIPE RATING INSIDE COMMENTS SECTION */}
        <div className='vr-comments__rating'>
          <h4 className='vr-comments__rating-title'>Rate this recipe</h4>
          <RatingWidget
            recipeId={recipeId}
            initialRating={initialRating}
            initialCount={initialRatingCount}
          />
        </div>

        {/* COMMENT INPUT */}
        <form
          className='vr-comment-input'
          onSubmit={submitComment}
        >
          <textarea
            placeholder={
              user
                ? 'Share your tips, tweaks, or how it turned out…'
                : 'Sign in to share your thoughts…'
            }
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={!user}
          />
          <button
            type='submit'
            disabled={!user || !newCommentText.trim()}
          >
            Comment
          </button>
        </form>

        {loading && <p className='vr-comment__empty'>Loading comments…</p>}

        {!loading && topLevel.length === 0 && (
          <p className='vr-comment__empty'>
            No comments yet. Be the first to share your experience!
          </p>
        )}

        {/* LIST OF COMMENTS */}
        <div className='vr-comments-list'>
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={replies.filter((r) => r.parent_id === comment.id)}
              user={user}
              recipeId={recipeId}
              loadComments={loadComments}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
