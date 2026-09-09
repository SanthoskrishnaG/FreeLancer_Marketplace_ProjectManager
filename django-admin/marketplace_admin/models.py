import uuid
from django.db import models

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, default='CLIENT')
    status = models.CharField(max_length=20, default='ACTIVE')
    avatar = models.TextField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'User'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.name} ({self.email}) [{self.role}]"


class ClientProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='userId', related_name='django_client_profile')
    company_name = models.CharField(db_column='companyName', max_length=255, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    total_spent = models.DecimalField(db_column='totalSpent', max_digits=12, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'ClientProfile'
        verbose_name = 'Client Profile'
        verbose_name_plural = 'Client Profiles'

    def __str__(self):
        return f"Client: {self.company_name or self.user.name}"


class FreelancerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='userId', related_name='django_freelancer_profile')
    title = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    hourly_rate = models.DecimalField(db_column='hourlyRate', max_digits=10, decimal_places=2, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    total_reviews = models.IntegerField(db_column='totalReviews', default=0)
    total_earned = models.DecimalField(db_column='totalEarned', max_digits=12, decimal_places=2, default=0.0)
    is_verified = models.BooleanField(db_column='isVerified', default=False)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'FreelancerProfile'
        verbose_name = 'Freelancer Profile'
        verbose_name_plural = 'Freelancer Profiles'

    def __str__(self):
        return f"{self.user.name} - {self.title or 'Freelancer'}"


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Category'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Skill'
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'

    def __str__(self):
        return self.name


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='OPEN')
    experience_level = models.CharField(db_column='experienceLevel', max_length=20, default='INTERMEDIATE')
    client = models.ForeignKey(User, on_delete=models.CASCADE, db_column='clientId', related_name='django_projects')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, db_column='categoryId', blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'Project'
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'

    def __str__(self):
        return f"{self.title} (${self.budget}) [{self.status}]"


class Milestone(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, db_column='projectId', blank=True, null=True, related_name='django_milestones')
    contract_id = models.UUIDField(db_column='contractId', blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    order = models.IntegerField(default=1)
    status = models.CharField(max_length=20, default='PENDING')
    acceptance_criteria = models.TextField(db_column='acceptanceCriteria', blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'Milestone'
        verbose_name = 'Milestone'
        verbose_name_plural = 'Milestones'

    def __str__(self):
        return f"Milestone: {self.title} (${self.amount}) [{self.status}]"


class Proposal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, db_column='projectId', related_name='django_proposals')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, db_column='freelancerId', related_name='django_freelancer_proposals')
    cover_letter = models.TextField(db_column='coverLetter')
    bid_amount = models.DecimalField(db_column='bidAmount', max_digits=12, decimal_places=2)
    estimated_duration_days = models.IntegerField(db_column='estimatedDurationDays', blank=True, null=True)
    status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'Proposal'
        verbose_name = 'Proposal'
        verbose_name_plural = 'Proposals'

    def __str__(self):
        return f"Proposal for {self.project.title} by {self.freelancer.name} (${self.bid_amount})"


class Contract(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, db_column='projectId')
    client = models.ForeignKey(User, on_delete=models.CASCADE, db_column='clientId', related_name='django_client_contracts')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, db_column='freelancerId', related_name='django_freelancer_contracts')
    total_amount = models.DecimalField(db_column='totalAmount', max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='ACTIVE')
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'Contract'
        verbose_name = 'Contract'
        verbose_name_plural = 'Contracts'

    def __str__(self):
        return f"Contract: {self.title} (${self.total_amount}) [{self.status}]"


class Dispute(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, db_column='contractId', related_name='django_disputes')
    opened_by = models.ForeignKey(User, on_delete=models.CASCADE, db_column='openedById')
    reason = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, default='OPEN')
    resolution = models.CharField(max_length=255, blank=True, null=True)
    resolution_notes = models.TextField(db_column='resolutionNotes', blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)
    updated_at = models.DateTimeField(db_column='updatedAt', auto_now=True)

    class Meta:
        managed = False
        db_table = 'Dispute'
        verbose_name = 'Dispute'
        verbose_name_plural = 'Disputes'

    def __str__(self):
        return f"Dispute: {self.contract.title} - {self.reason} [{self.status}]"


class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(db_column='invoiceNumber', max_length=50, unique=True)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, db_column='contractId')
    client = models.ForeignKey(User, on_delete=models.CASCADE, db_column='clientId', related_name='django_client_invoices')
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, db_column='freelancerId', related_name='django_freelancer_invoices')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, default='PENDING')
    pdf_url = models.TextField(db_column='pdfUrl', blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Invoice'
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"Invoice {self.invoice_number} (${self.total})"


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userId')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    fee = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    currency = models.CharField(max_length=10, default='USD')
    status = models.CharField(max_length=20, default='PENDING')
    provider = models.CharField(max_length=50, default='MOCK')
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"Payment ${self.amount} via {self.provider} [{self.status}]"


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, db_column='contractId')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, db_column='reviewerId', related_name='django_given_reviews')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='targetUserId', related_name='django_received_reviews')
    rating = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Review'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'

    def __str__(self):
        return f"Review: {self.rating}/5 for {self.target_user.name}"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, db_column='userId', blank=True, null=True)
    action = models.CharField(max_length=255)
    entity = models.CharField(max_length=255)
    entity_id = models.CharField(db_column='entityId', max_length=255, blank=True, null=True)
    details = models.TextField(blank=True, null=True)
    ip_address = models.CharField(db_column='ipAddress', max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(db_column='createdAt', auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'AuditLog'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        return f"Audit: {self.action} on {self.entity} ({self.created_at})"
