'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import styles from './page.module.css';

interface Category {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    _count: {
        campaigns: number;
    };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: '',
        color: '#6366f1',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Failed to save category');
                return;
            }

            await fetchCategories();
            resetForm();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleEdit = (category: Category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            icon: category.icon || '',
            color: category.color || '#6366f1',
        });
        setEditingId(category.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Failed to delete category');
                return;
            }

            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', icon: '', color: '#6366f1' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1>Campaign Categories</h1>
                    <p>Organize campaigns by type for better discovery and reporting</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ New Category'}
                </Button>
            </div>

            {showForm && (
                <Card className={styles.formCard}>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Category' : 'New Category'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Category Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Building Projects"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Icon (Emoji)</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="🏗️"
                                        maxLength={2}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Color</label>
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category"
                                    rows={2}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingId ? 'Update' : 'Create'} Category
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className={styles.loading}>Loading categories...</div>
            ) : (
                <div className={styles.grid}>
                    {categories.map((category) => (
                        <Card key={category.id} className={styles.categoryCard}>
                            <div className={styles.categoryHeader}>
                                <div className={styles.categoryIcon} style={{ backgroundColor: category.color || '#6366f1' }}>
                                    {category.icon || '📁'}
                                </div>
                                <div className={styles.categoryInfo}>
                                    <h3>{category.name}</h3>
                                    <p>{category.description || 'No description'}</p>
                                    <span className={styles.campaignCount}>
                                        {category._count.campaigns} campaign{category._count.campaigns !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.categoryActions}>
                                <Button size="small" variant="outline" onClick={() => handleEdit(category)}>
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    variant="ghost"
                                    onClick={() => handleDelete(category.id)}
                                    disabled={category._count.campaigns > 0}
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
